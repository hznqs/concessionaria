import { prisma } from "@/lib/prisma";
import Image from "next/image";
import Link from "next/link";
import { formatCurrency, formatMileage, FUEL_LABELS } from "@/lib/utils";

interface RelatedVehiclesProps {
  brandId:   string;
  excludeId: string;
}

export default async function RelatedVehicles({ brandId, excludeId }: RelatedVehiclesProps) {
  const vehicles = await prisma.vehicle.findMany({
    where: {
      brandId,
      status: "AVAILABLE",
      NOT: { id: excludeId },
    },
    take: 4,
    orderBy: { createdAt: "desc" },
    include: {
      brand:  { select: { name: true } },
      model:  { select: { name: true } },
      images: { where: { isCover: true }, take: 1 },
    },
  });

  if (!vehicles.length) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {vehicles.map((v) => {
        const cover = v.images[0];
        return (
          <Link
            key={v.id}
            href={`/veiculos/${v.slug}`}
            className="glass rounded-2xl overflow-hidden group hover:-translate-y-1 transition-all duration-300 hover:shadow-card-lg"
          >
            {/* Image */}
            <div className="relative aspect-[16/10] bg-ink-100 dark:bg-ink-900 overflow-hidden">
              {cover ? (
                <Image
                  src={cover.url}
                  alt={v.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 640px) 100vw, 25vw"
                />
              ) : (
                <div className="inset-0 absolute flex items-center justify-center text-ink-500 text-sm">
                  Sem foto
                </div>
              )}
            </div>

            {/* Info */}
            <div className="p-4">
              <p className="text-ink-900 dark:text-white font-semibold text-sm truncate">{v.title}</p>
              <p className="text-ink-500 dark:text-ink-500 text-xs mt-0.5">
                {v.yearMfr}/{v.yearModel} · {formatMileage(v.mileage)}
              </p>
              <p className="text-primary-500 dark:text-primary-400 font-bold mt-2">
                {formatCurrency(Number(v.price))}
              </p>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
