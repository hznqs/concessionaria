import { NextRequest, NextResponse } from "next/server";
import { getVehicles, getFacets, VehicleFiltersSchema, VehicleSortSchema, PaginationSchema } from "@/lib/vehicles";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    const sp = req.nextUrl.searchParams;

    const filters = VehicleFiltersSchema.parse({
      brandIds: sp.getAll("brandIds"),
      modelIds: sp.getAll("modelIds"),
      fuelTypes: sp.getAll("fuelTypes"),
      transmissionTypes: sp.getAll("transmissionTypes"),
      bodyTypes: sp.getAll("bodyTypes"),
      colors: sp.getAll("colors"),
      statuses: sp.getAll("statuses"),
      yearModelMin: sp.get("yearMin") ? Number(sp.get("yearMin")) : undefined,
      yearModelMax: sp.get("yearMax") ? Number(sp.get("yearMax")) : undefined,
      priceMin: sp.get("priceMin") ? Number(sp.get("priceMin")) : undefined,
      priceMax: sp.get("priceMax") ? Number(sp.get("priceMax")) : undefined,
      mileageMin: sp.get("mileageMin") ? Number(sp.get("mileageMin")) : undefined,
      mileageMax: sp.get("mileageMax") ? Number(sp.get("mileageMax")) : undefined,
      search: sp.get("search") ?? undefined,
      featured: sp.has("featured") ? sp.get("featured") === "true" : undefined,
    });

    const pagination = PaginationSchema.parse({
      page: sp.get("page") ?? 1,
      pageSize: sp.get("pageSize") ?? 12,
    });

    const sort = VehicleSortSchema.parse(sp.get("sort") ?? "created_desc");

    const result = await getVehicles(filters, pagination, sort);
    const facets = await getFacets(filters);

    return NextResponse.json({
      vehicles: result.vehicles.map((v) => ({
        id: v.id,
        slug: v.slug,
        title: v.title,
        price: Number(v.price),
        yearMfr: v.yearMfr,
        yearModel: v.yearModel,
        mileage: v.mileage,
        fuel: v.fuel,
        transmission: v.transmission,
        bodyType: v.bodyType,
        color: v.color,
        doors: v.doors,
        status: v.status,
        featured: v.featured,
        createdAt: v.createdAt,
        brand: { id: v.brand.id, name: v.brand.name },
        model: { id: v.model.id, name: v.model.name },
        images: v.images.map((img) => ({
          id: img.id,
          url: img.url,
          isCover: img.isCover,
          alt: img.alt,
        })),
      })),
      total: result.total,
      totalPages: result.totalPages,
      facets,
    });
  } catch (err) {
    console.error("[CATALOG GET]", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
