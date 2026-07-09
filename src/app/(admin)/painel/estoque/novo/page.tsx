import { prisma } from "@/lib/prisma";
import MultiStepForm from "@/components/admin/vehicle-form/multi-step-form";

async function getFormData() {
  const [brands, features] = await Promise.all([
    prisma.brand.findMany({
      where:   { active: true },
      orderBy: { name: "asc" },
      include: { models: { orderBy: { name: "asc" } } },
    }),
    prisma.feature.findMany({ orderBy: [{ category: "asc" }, { name: "asc" }] }),
  ]);
  return { brands, features };
}

export default async function NovoVeiculoPage() {
  const { brands, features } = await getFormData();
  return <MultiStepForm brands={brands} features={features} />;
}
