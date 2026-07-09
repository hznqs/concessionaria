import type { Metadata } from "next";
import Image from "next/image";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { unstable_cache } from "next/cache";

export const metadata: Metadata = {
  title: "Nossas Unidades | AutoPrime",
  description: "Encontre a AutoPrime mais próxima de você.",
};

const getStores = unstable_cache(
  () => prisma.store.findMany({
    where: { active: true },
    orderBy: { order: "asc" },
  }),
  ["stores"],
  { revalidate: 300, tags: ["stores"] },
);

export default async function UnidadesPage() {
  const stores = await getStores();
  return (
    <div className="bg-ink-950 min-h-screen pt-32 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        {/* Page title */}
        <div className="mb-16 border-b border-white/5 pb-8 text-center sm:text-left">
          <p className="text-primary-500 text-[10px] font-bold uppercase tracking-[0.3em] mb-4 flex items-center justify-center sm:justify-start gap-4">
            <span className="w-12 h-px bg-primary-500" />
            Visite-nos
          </p>
          <h1 className="font-display text-4xl sm:text-6xl text-white mb-4 leading-tight">
            Nossas <span className="italic font-light text-ink-500">Unidades</span>
          </h1>
          <p className="text-ink-400 text-sm font-light tracking-wide max-w-2xl">
            Ambientes projetados para oferecer conforto e privacidade. Venha tomar um café conosco e conhecer seu próximo veículo.
          </p>
        </div>

        {/* Stores Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-24">
          {stores.map((store) => (
            <div key={store.id} className="group flex flex-col bg-ink-900 border border-white/5 hover:border-primary-500/30 transition-colors duration-500">
              {/* Image */}
              <div className="relative aspect-[4/3] overflow-hidden">
                <Image
                  src={store.image}
                  alt={store.name}
                  fill
                  className="object-cover grayscale group-hover:grayscale-0 scale-100 group-hover:scale-105 transition-all duration-700"
                />
              </div>

              {/* Info */}
              <div className="p-8 flex flex-col grow">
                <h2 className="font-display text-2xl text-white mb-6">{store.name}</h2>
                
                <ul className="space-y-4 text-xs font-light text-ink-400 tracking-wide grow mb-8">
                  <li className="flex items-start gap-3">
                    <MapPin size={14} className="text-primary-500 shrink-0 mt-0.5" />
                    <span>{store.address}<br/>{store.city}</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Phone size={14} className="text-primary-500 shrink-0" />
                    <span>{store.phone}</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Mail size={14} className="text-primary-500 shrink-0" />
                    <span>{store.email}</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Clock size={14} className="text-primary-500 shrink-0" />
                    <span>{store.hours}</span>
                  </li>
                </ul>

                <a
                  href={`https://maps.google.com/?q=${encodeURIComponent(store.address + " " + store.city)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-outline w-full py-4 flex items-center justify-center gap-2"
                >
                  <MapPin size={14} />
                  Ver no Mapa
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* Map Placeholder */}
        <div className="w-full h-96 bg-ink-900 border border-white/5 relative overflow-hidden flex items-center justify-center group">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=1200&auto=format&fit=crop')] bg-cover bg-center opacity-10 group-hover:opacity-20 transition-opacity duration-700 grayscale" />
          <div className="relative z-10 text-center">
            <MapPin size={32} className="text-primary-500 mx-auto mb-4" />
            <h3 className="font-display text-2xl text-white mb-2">Localização Global</h3>
            <p className="text-ink-400 text-xs tracking-widest uppercase">Mapa interativo em breve</p>
          </div>
        </div>

      </div>
    </div>
  );
}
