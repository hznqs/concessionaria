import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { revalidateTag, revalidatePath } from "next/cache";
import { FuelType, TransmissionType, BodyType, VehicleStatus, Prisma } from "@prisma/client";
import { requireAdmin, requireCsrf } from "@/lib/admin-auth";
import { unlink } from "fs/promises";
import path from "path";
import { deleteFromR2 } from "@/lib/upload";
export const runtime = "nodejs";

type RouteParams = { params: { id: string } };

function isPrismaNotFound(err: unknown): boolean {
  return (
    typeof err === "object" &&
    err !== null &&
    "code" in err &&
    (err as { code: string }).code === "P2025"
  );
}

const PUBLIC_VEHICLE_SELECT = {
  id: true,
  slug: true,
  title: true,
  price: true,
  yearMfr: true,
  yearModel: true,
  mileage: true,
  color: true,
  fuel: true,
  transmission: true,
  bodyType: true,
  doors: true,
  description: true,
  status: true,
  featured: true,
  createdAt: true,
  brand: { select: { id: true, name: true, slug: true } },
  model: { select: { id: true, name: true, slug: true } },
  images: { orderBy: { order: "asc" as const } },
  features: { include: { feature: true } },
} satisfies Prisma.VehicleSelect;

// GET single vehicle (public — never exposes chassis/plate/internalNotes;
// non-admin callers can only fetch AVAILABLE vehicles)
export async function GET(_req: NextRequest, { params }: RouteParams) {
  try {
    const isAdmin = !!(await requireAdmin());

    const vehicle = await prisma.vehicle.findUnique({
      where: { id: params.id },
      select: { ...PUBLIC_VEHICLE_SELECT, status: true },
    });
    if (!vehicle) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (!isAdmin && vehicle.status !== "AVAILABLE") {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json(vehicle);
  } catch (err) {
    console.error("[VEHICLE GET]", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

const updateVehicleSchema = z.object({
  title:        z.string().min(3).optional(),
  slug:         z.string().optional(),
  price:        z.coerce.number().positive().optional(),
  yearMfr:      z.coerce.number().optional(),
  yearModel:    z.coerce.number().optional(),
  mileage:      z.coerce.number().min(0).optional(),
  color:        z.string().optional(),
  fuel:         z.nativeEnum(FuelType).optional(),
  transmission: z.nativeEnum(TransmissionType).optional(),
  bodyType:     z.nativeEnum(BodyType).optional(),
  doors:        z.coerce.number().optional(),
  description:  z.string().optional(),
  status:       z.nativeEnum(VehicleStatus).optional(),
  featured:     z.boolean().optional(),
  chassis:      z.string().optional(),
  plate:        z.string().optional(),
  internalNotes: z.string().optional(),
  highlights:   z.array(z.string()).optional(),
  images: z.array(z.object({
    url:     z.string().min(1),
    isCover: z.boolean().default(false),
    alt:     z.string().optional(),
  })).optional(),
  featureIds: z.array(z.string()).optional(),
}).strict();

// PUT update (admin only)
export async function PUT(req: NextRequest, { params }: RouteParams) {
  const id = params?.id;
  console.log("[VEHICLE PUT] id:", id);
  if (!id) {
    console.log("[VEHICLE PUT] Missing vehicle id");
    return NextResponse.json({ error: "Missing vehicle id" }, { status: 400 });
  }
  try {
    requireCsrf(req);
  } catch {
    console.log("[VEHICLE PUT] CSRF failed");
    return NextResponse.json({ error: "CSRF validation failed" }, { status: 403 });
  }

  const session = await requireAdmin();
  if (!session) {
    console.log("[VEHICLE PUT] No admin session");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  console.log("[VEHICLE PUT] body:", JSON.stringify(body));
  try {
    const parsed = updateVehicleSchema.parse(body);
    const { fuel, transmission, bodyType, status, slug, images, featureIds, ...rest } = parsed;
    const data: Prisma.VehicleUpdateInput = { ...rest };

    // Automação de Preço Promocional: Se o preço abaixou, salva o antigo em oldPrice
    const currentVehicle = await prisma.vehicle.findUnique({ where: { id } });
    if (currentVehicle && rest.price !== undefined && Number(rest.price) < Number(currentVehicle.price)) {
      data.oldPrice = currentVehicle.price;
    }
    if (fuel) data.fuel = fuel;
    if (transmission) data.transmission = transmission;
    if (bodyType) data.bodyType = bodyType;
    if (status) data.status = status;
    if (slug) data.slug = slug;

    // soldAt: registar timestamp quando vira SOLD, limpar quando sai de SOLD.
    if (status === "SOLD") {
      data.soldAt = new Date();
    } else if (status) {
      // status passou a qualquer valor não-SOLD → limpa soldAt.
      data.soldAt = null;
    }

    const vehicle = await prisma.vehicle.update({
      where: { id },
      data,
    });
    console.log("[VEHICLE PUT] updated:", vehicle.id, "status:", vehicle.status);

    // Substitui imagens do veículo (delete + re-create) quando enviadas
    if (images) {
      await prisma.vehicleImage.deleteMany({ where: { vehicleId: id } });
      if (images.length > 0) {
        await prisma.vehicle.update({
          where: { id },
          data: {
            images: {
              create: images.map((img, i) => ({
                url:     img.url,
                isCover: img.isCover,
                alt:     img.alt ?? vehicle.title,
                order:   i,
              })),
            },
          },
        });
      }
    }

    // Substitui features (M:N) quando enviadas
    if (featureIds) {
      await prisma.vehicleFeature.deleteMany({ where: { vehicleId: id } });
      if (featureIds.length > 0) {
        await prisma.vehicleFeature.createMany({
          data: featureIds.map((featureId) => ({ vehicleId: id, featureId })),
          skipDuplicates: true,
        });
      }
    }

    revalidateTag('vehicles');
    revalidateTag('dashboard');
    revalidatePath('/painel');
    revalidatePath('/painel/relatorios');
    revalidatePath(`/veiculos/${vehicle.slug}`);
    revalidatePath('/painel/estoque');

    return NextResponse.json(vehicle);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation", details: err.errors }, { status: 400 });
    }
    if (isPrismaNotFound(err)) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    console.error("[VEHICLE PUT]", err);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}

// DELETE (admin only)
export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    requireCsrf(req);
  } catch {
    return NextResponse.json({ error: "CSRF validation failed" }, { status: 403 });
  }

  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const images = await prisma.vehicleImage.findMany({
      where: { vehicleId: params.id },
      select: { url: true },
    });

    const vehicle = await prisma.vehicle.findUnique({
      where: { id: params.id },
      select: { slug: true },
    });

    if (!vehicle) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await prisma.vehicle.delete({ where: { id: params.id } });

    // Clean up image files from storage
    for (const img of images) {
      // Extract filename robustly (handle query strings, etc.)
      const urlPath = img.url.split("?")[0];
      const filename = urlPath.split("/").pop();
      if (!filename) continue;

      if (img.url.includes("r2.dev") || img.url.includes(".r2.cloudflarestorage.com")) {
        await deleteFromR2(filename);
      } else if (!img.url.startsWith("http")) {
        try {
          const filepath = path.join(process.cwd(), "public", "uploads", filename);
          await unlink(filepath);
        } catch (e) {
          if ((e as NodeJS.ErrnoException).code !== "ENOENT") {
            console.error("[VEHICLE DELETE] file cleanup failed", filename, e);
          }
        }
      }
    }

    revalidateTag("vehicles");
    revalidateTag("dashboard");
    revalidatePath(`/veiculos/${vehicle.slug}`);

    return NextResponse.json({ success: true });
  } catch (err) {
    if (isPrismaNotFound(err)) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    console.error("[VEHICLE DELETE]", err);
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}
