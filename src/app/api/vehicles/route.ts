import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { slugify } from "@/lib/utils";
import { revalidateTag, revalidatePath } from "next/cache";
import { FuelType, TransmissionType, BodyType, VehicleStatus, Prisma } from "@prisma/client";
import { requireAdmin, requireCsrf } from "@/lib/admin-auth";
export const runtime = "nodejs";

const MAX_LIMIT = 50;

const vehicleSchema = z.object({
  brandName:    z.string().min(1),
  modelName:    z.string().min(1),
  title:        z.string().min(3),
  slug:         z.string().optional(),
  price:        z.coerce.number().positive(),
  yearMfr:      z.coerce.number(),
  yearModel:    z.coerce.number(),
  mileage:      z.coerce.number().min(0),
  color:        z.string(),
  fuel:         z.nativeEnum(FuelType),
  transmission: z.nativeEnum(TransmissionType),
  bodyType:     z.nativeEnum(BodyType),
  doors:        z.coerce.number().default(4),
  description:  z.string().optional(),
  status:       z.nativeEnum(VehicleStatus).default("AVAILABLE"),
  featured:     z.boolean().default(false),
  chassis:      z.string().refine((v) => !v || /^[A-Za-z0-9]{17}$/.test(v), { message: "Chassi deve ter 17 caracteres alfanuméricos" }).optional(),
  plate:        z.string().refine((v) => !v || /^[A-Z]{3}[0-9][0-9A-Z][0-9]{2}$|^[A-Z]{3}[0-9]{4}$/.test(v), { message: "Placa inválida (formato XXX-XXXX ou Mercosul)" }).optional(),
  internalNotes: z.string().optional(),
  images: z.array(z.object({
    url:     z.string().min(1),
    isCover: z.boolean().default(false),
    alt:     z.string().optional(),
    order:   z.number().optional(),
  })).default([]),
  featureIds: z.array(z.string()).default([]),
  highlights: z.array(z.string()).default([]),
}).strict();

// GET all vehicles (public — excludes chassis/plate/internalNotes/views/soldAt)
export async function GET(req: NextRequest) {
  const sp     = req.nextUrl.searchParams;
  const statusParam = sp.get("status");
  const brand  = sp.get("brand");
  const limit  = Math.min(Math.max(parseInt(sp.get("limit") ?? "20") || 20, 1), MAX_LIMIT);

  try {
    const isAdmin = !!(await requireAdmin());

    // Public callers can ONLY see AVAILABLE. Admins may request any status.
    let status: VehicleStatus | undefined;
    if (statusParam) {
      status = statusParam as VehicleStatus;
    } else if (!isAdmin) {
      status = "AVAILABLE";
    }

    if (!isAdmin && status && status !== "AVAILABLE") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const where: Prisma.VehicleWhereInput = {
      ...(status ? { status } : {}),
      ...(brand  ? { brand: { slug: brand } } : {}),
    };

    const vehicles = await prisma.vehicle.findMany({
      where,
      take:    limit,
      orderBy: { createdAt: "desc" },
      select: {
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
        brand:  { select: { name: true, slug: true } },
        model:  { select: { name: true, slug: true } },
        images: { where: { isCover: true }, take: 1, select: { url: true, alt: true, isCover: true } },
      },
    });

    return NextResponse.json(vehicles);
  } catch (err) {
    console.error("[VEHICLES GET]", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

// POST create vehicle (admin only)
export async function POST(req: NextRequest) {
  try {
    requireCsrf(req);
  } catch {
    return NextResponse.json({ error: "CSRF validation failed" }, { status: 403 });
  }

  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const data = vehicleSchema.parse(body);

    const slug = data.slug ?? slugify(`${data.title}-${data.yearModel}-${Date.now()}`);

    const brandSlug = slugify(data.brandName);
    const brand = await prisma.brand.upsert({
      where: { slug: brandSlug },
      update: { name: data.brandName },
      create: { name: data.brandName, slug: brandSlug },
    });

    const modelSlug = slugify(data.modelName);
    const model = await prisma.carModel.upsert({
      where: { brandId_slug: { brandId: brand.id, slug: modelSlug } },
      update: { name: data.modelName },
      create: { name: data.modelName, slug: modelSlug, brandId: brand.id },
    });

    const vehicle = await prisma.vehicle.create({
      data: {
        brandId:      brand.id,
        modelId:      model.id,
        title:        data.title,
        slug,
        price:        data.price,
        yearMfr:      data.yearMfr,
        yearModel:    data.yearModel,
        mileage:      data.mileage,
        color:        data.color,
        fuel:         data.fuel,
        transmission: data.transmission,
        bodyType:     data.bodyType,
        doors:        data.doors,
        description:  data.description ?? null,
        status:       data.status,
        featured:     data.featured,
        highlights:   data.highlights,
        chassis:      data.chassis ?? null,
        plate:        data.plate ?? null,
        internalNotes: data.internalNotes ?? null,
        images: {
          create: data.images.map((img, i) => ({
            url:     img.url,
            isCover: img.isCover,
            alt:     img.alt ?? data.title,
            order:   img.order ?? i,
          })),
        },
        features: data.featureIds.length > 0
          ? {
              create: data.featureIds.map((featureId) => ({ featureId })),
            }
          : undefined,
      },
    });

    revalidateTag('vehicles');
    revalidateTag('dashboard');
    revalidatePath('/painel');
    revalidatePath('/painel/relatorios');
    revalidatePath('/painel/estoque');

    return NextResponse.json(vehicle, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation", details: err.errors }, { status: 400 });
    }
    console.error("[VEHICLES POST]", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
