import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { cache } from "react";
import { prisma } from "@/lib/prisma";
import { getWhatsappNumber } from "@/lib/settings";
import { getVehicleBySlug, getRelatedVehicles } from "@/lib/vehicles";
import {
  formatCurrency,
  formatMileage,
  FUEL_LABELS,
  TRANSMISSION_LABELS,
  BODY_TYPE_LABELS,
} from "@/lib/utils";
import { VehicleGallery } from "@/components/public/vehicle-detail/VehicleGallery";
import { FinancingCalculator } from "@/components/public/vehicle-detail/FinancingCalculator";
import { TrustBadges } from "@/components/public/vehicle-detail/TrustBadges";
import { VehicleFAQ } from "@/components/public/vehicle-detail/VehicleFAQ";
import { StickyCTABar } from "@/components/public/vehicle-detail/StickyCTABar";
import VehicleSpecs from "@/components/public/vehicle-specs";
import VehicleFeatures from "@/components/public/vehicle-features";
import VehicleStatusBadge from "@/components/public/vehicle-status-badge";
import BreadcrumbNav from "@/components/public/breadcrumb-nav";
import ShareVehicle from "@/components/public/share-vehicle";
import FavoriteButton from "@/components/public/favorite-button";
import LeadForm from "@/components/public/lead-form";
import { VehicleViewTracker } from "@/components/public/vehicle-detail/VehicleViewTracker";
import { VehicleCard } from "@/components/public/catalog/VehicleCard";
import type { VehicleWithRelations } from "@/lib/vehicles";
import {
  ClipboardList,
  Star,
  FileText,
  CarFront,
  Calendar,
  MapPin,
  Fuel,
  Settings2,
  Palette,
  Check,
} from "lucide-react";

const getVehicleData = cache(async (slug: string) => {
  const vehicle = await getVehicleBySlug(slug);
  if (!vehicle) return null;

  return vehicle;
});

function buildVehicleJsonLd(vehicle: NonNullable<Awaited<ReturnType<typeof getVehicleData>>>) {
  const coverImage = vehicle.images.find((i) => i.isCover) ?? vehicle.images[0];
  return {
    "@context": "https://schema.org",
    "@type": "Vehicle",
    name: vehicle.title,
    brand: vehicle.brand.name,
    model: vehicle.model.name,
    vehicleModelDate: String(vehicle.yearModel),
    mileageFromOdometer: formatMileage(vehicle.mileage),
    fuelType: FUEL_LABELS[vehicle.fuel] ?? vehicle.fuel,
    color: vehicle.color,
    offers: {
      "@type": "Offer",
      price: Number(vehicle.price),
      priceCurrency: "BRL",
      availability:
        vehicle.status === "AVAILABLE"
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
    },
    image: coverImage?.url,
  };
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const vehicle = await getVehicleData(params.slug);
  if (!vehicle) return { title: "Veículo não encontrado" };

  const coverImage = vehicle.images.find((i) => i.isCover) ?? vehicle.images[0];

  return {
    title: `${vehicle.title} ${vehicle.yearModel} | AutoPrime`,
    description: `${vehicle.brand.name} ${vehicle.model.name} ${vehicle.yearMfr}/${vehicle.yearModel} — ${formatMileage(vehicle.mileage)} — ${formatCurrency(Number(vehicle.price))}. Confira!`,
    openGraph: {
      title: vehicle.title,
      description: vehicle.description ?? undefined,
      images: coverImage ? [{ url: coverImage.url, alt: vehicle.title }] : [],
    },
  };
}

export default async function VehicleDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const vehicle = await getVehicleData(params.slug);
  if (!vehicle) notFound();

  const price = Number(vehicle.price);
  const oldPrice = vehicle.oldPrice ? Number(vehicle.oldPrice) : null;

  const fuelLabel = FUEL_LABELS[vehicle.fuel] ?? vehicle.fuel;
  const transLabel = TRANSMISSION_LABELS[vehicle.transmission] ?? vehicle.transmission;
  const bodyLabel = BODY_TYPE_LABELS[vehicle.bodyType] ?? vehicle.bodyType;

  const featuresByCategory = vehicle.features.reduce<
    Record<string, typeof vehicle.features>
  >((acc, vf) => {
    const cat = vf.feature.category;
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(vf);
    return acc;
  }, {});

  const related = await getRelatedVehicles(vehicle.id, vehicle.brandId, vehicle.bodyType, 6);

  const phone = await getWhatsappNumber();
  const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(
    `Olá! Tenho interesse no ${vehicle.title} ${vehicle.yearModel} anunciado no site.`
  )}`;

  const galleryImages = vehicle.images.map((img) => ({
    id: img.id,
    url: img.url,
    alt: img.alt,
    isCover: img.isCover,
    order: img.order ?? 0,
  }));

  const jsonLd = buildVehicleJsonLd(vehicle);

  return (
    <main className="min-h-screen bg-ink-50 dark:bg-ink-950 pt-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Breadcrumb */}
      <div className="border-b border-ink-200 dark:border-ink-700 bg-white dark:bg-ink-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
          <BreadcrumbNav
            items={[
              { label: "Veículos", href: "/veiculos" },
              { label: vehicle.brand.name, href: `/veiculos?brand=${vehicle.brand.slug}` },
              { label: vehicle.title },
            ]}
          />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 lg:py-12">
        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <VehicleStatusBadge status={vehicle.status} />
            {vehicle.featured && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary-50 text-primary-600 border border-primary-200">
                <Star size={14} className="fill-current" /> Destaque
              </span>
            )}
            <span className="text-ink-500 text-sm font-medium">
              {vehicle.views} visualizações
            </span>
            <div className="flex items-center gap-4 ml-auto">
              <ShareVehicle
                title={vehicle.title}
                price={formatCurrency(Number(vehicle.price))}
              />
              <FavoriteButton vehicleId={vehicle.id} size="md" />
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-ink-900 dark:text-ink-100 mb-2 text-balance">
            {vehicle.title}
          </h1>

          <div className="flex flex-wrap gap-2 mb-2">
            {[
              { icon: <Calendar size={14} />, label: `${vehicle.yearMfr}/${vehicle.yearModel}` },
              { icon: <MapPin size={14} />, label: formatMileage(vehicle.mileage) },
              { icon: <Fuel size={14} />, label: fuelLabel },
              { icon: <Settings2 size={14} />, label: transLabel },
              { icon: <Palette size={14} />, label: vehicle.color },
            ].map((item) => (
              <span
                key={item.label}
                className="bg-white dark:bg-ink-900 border border-ink-200 dark:border-ink-700 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs text-ink-700 dark:text-ink-300 font-medium"
              >
                <span className="text-ink-500">{item.icon}</span>
                {item.label}
              </span>
            ))}
          </div>
        </div>

        {/* Gallery + Conversion Widget */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_minmax(0,400px)] gap-6 lg:gap-8 xl:gap-12 mb-12">
          <div className="flex flex-col min-w-0 space-y-6">
            <VehicleGallery images={galleryImages} title={vehicle.title} />

            {/* Trust badges */}
            <TrustBadges />

            {/* Highlights */}
            {(vehicle.highlights?.length ?? 0) > 0 && (
              <div className="bg-white dark:bg-ink-900 rounded-2xl p-5 shadow-sm border border-ink-200 dark:border-ink-700">
                <h3 className="text-sm font-bold text-ink-900 dark:text-ink-100 uppercase tracking-widest mb-3">
                  Pontos de Destaque
                </h3>
                <ul className="space-y-2">
                  {vehicle.highlights.map((h: string) => (
                    <li key={h} className="flex items-start gap-2 text-sm text-ink-700 dark:text-ink-300">
                      <Check className="text-primary-500 shrink-0 mt-0.5" size={16} />
                      <span className="font-medium">{h}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="space-y-4">
            {/* Price card */}
            <div className="bg-white dark:bg-ink-900 rounded-2xl p-6 border border-ink-200 dark:border-ink-700 shadow-sm">
              {oldPrice && (
                <p className="text-ink-500 line-through text-sm mb-1 font-medium">
                  {formatCurrency(oldPrice)}
                </p>
              )}
              <p className="text-4xl font-black text-ink-900 dark:text-ink-100">
                {formatCurrency(price)}
              </p>
              <p className="text-ink-600 dark:text-ink-400 font-medium text-sm mt-1">
                ou financiado em até 60x com taxas reduzidas
              </p>

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 w-full flex items-center justify-center gap-3 py-4 rounded-xl font-bold text-white text-sm bg-[#25d366] hover:bg-[#20c05c] shadow-lg shadow-green-500/20 transition-all hover:-translate-y-0.5"
              >
                <WhatsAppIcon />
                Negociar via WhatsApp
              </a>
            </div>

            {/* Financing Calculator */}
            <div id="calculadora">
              <FinancingCalculator vehiclePrice={price} vehicleTitle={vehicle.title} />
            </div>

            {/* Lead form */}
            <LeadForm vehicleId={vehicle.id} vehicleTitle={vehicle.title} />
          </div>
        </div>

        {/* Specs + Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 mb-12">
          <section>
            <SectionTitle icon={<ClipboardList className="text-primary-500" size={24} />} title="Ficha Técnica" />
            <VehicleSpecs vehicle={vehicle} />
          </section>

          {Object.keys(featuresByCategory).length > 0 && (
            <section>
              <SectionTitle icon={<Star className="text-primary-500" size={24} />} title="Opcionais e Acessórios" />
              <VehicleFeatures featuresByCategory={featuresByCategory} />
            </section>
          )}
        </div>

        {/* Description */}
        {vehicle.description && (
          <section className="mb-12">
            <SectionTitle icon={<FileText className="text-primary-500" size={24} />} title="Descrição do Veículo" />
            <div className="bg-white dark:bg-ink-900 border border-ink-200 dark:border-ink-700 rounded-2xl p-6 shadow-sm">
              <p className="text-ink-700 dark:text-ink-300 leading-relaxed whitespace-pre-line text-sm font-medium">
                {vehicle.description}
              </p>
            </div>
          </section>
        )}

        {/* FAQ */}
        <section className="mb-12">
          <VehicleFAQ />
        </section>

        {/* Related */}
        {related.length > 0 && (
          <section>
            <SectionTitle icon={<CarFront className="text-primary-500" size={24} />} title="Você também pode gostar" />
            <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {related.map((v, idx) => (
                <VehicleCard key={v.id} vehicle={v as unknown as VehicleWithRelations} index={idx} />
              ))}
            </div>
          </section>
        )}
      </div>

      <VehicleViewTracker vehicleId={vehicle.id} />

      {/* Sticky Mobile CTA */}
      <StickyCTABar
        vehicleId={vehicle.id}
        vehicleTitle={vehicle.title}
        price={price}
        whatsappUrl={whatsappUrl}
      />
    </main>
  );
}

function SectionTitle({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <div className="text-xl">{icon}</div>
      <h2 className="text-xl font-bold text-ink-900 dark:text-ink-100">{title}</h2>
      <div className="flex-1 h-px bg-ink-200 dark:bg-ink-700" />
    </div>
  );
}

function WhatsAppIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

export async function generateStaticParams() {
  // Gera todas as páginas (incluindo vendidos) — vendidos ficam visíveis
  // no link /veiculos/vendidos. ISR mantém via default revalidate (60s).
  const vehicles = await prisma.vehicle.findMany({
    select: { slug: true },
  });
  return vehicles.map((v) => ({ slug: v.slug }));
}
