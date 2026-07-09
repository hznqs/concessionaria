import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import MultiStepForm from "@/components/admin/vehicle-form/multi-step-form";

interface PageProps {
  params: { id: string };
}

async function getVehicle(id: string) {
  return prisma.vehicle.findUnique({
    where: { id },
    include: {
      brand: { select: { id: true, name: true, slug: true } },
      model: { select: { id: true, name: true, slug: true } },
      images: { orderBy: { order: "asc" } },
      features: { select: { featureId: true } },
    },
  });
}

async function getFormData() {
  const [brands, features] = await Promise.all([
    prisma.brand.findMany({
      where: { active: true },
      orderBy: { name: "asc" },
      include: { models: { orderBy: { name: "asc" } } },
    }),
    prisma.feature.findMany({ orderBy: [{ category: "asc" }, { name: "asc" }] }),
  ]);
  return { brands, features };
}

export default async function EditVeiculoPage({ params }: PageProps) {
  const [vehicle, { brands, features }] = await Promise.all([
    getVehicle(params.id),
    getFormData(),
  ]);

  if (!vehicle) notFound();

  return (
    <MultiStepForm
      brands={brands}
      features={features}
      vehicle={{
        id: vehicle.id,
        title: vehicle.title,
        slug: vehicle.slug,
        price: Number(vehicle.price),
        yearMfr: vehicle.yearMfr,
        yearModel: vehicle.yearModel,
        mileage: vehicle.mileage,
        color: vehicle.color,
        fuel: vehicle.fuel,
        transmission: vehicle.transmission,
        bodyType: vehicle.bodyType,
        doors: vehicle.doors,
        description: vehicle.description,
        status: vehicle.status,
        featured: vehicle.featured,
        chassis: vehicle.chassis,
        plate: vehicle.plate,
        internalNotes: vehicle.internalNotes,
        brand: vehicle.brand,
        model: vehicle.model,
        images: vehicle.images.map(i => ({ url: i.url, isCover: i.isCover, alt: i.alt })),
        features: vehicle.features,
        highlights: vehicle.highlights as string[],
      }}
    />
  );
}
