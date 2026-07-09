import { Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getWhatsappNumber } from "@/lib/settings";
import HeroSearch from "@/components/public/hero-search";
import VehicleCardComponent from "@/components/public/vehicle-card";
import BrandStrip from "@/components/public/brand-strip";
import { ParallaxHero } from "@/components/ui/parallax-hero";
import { Container, Section, SectionHeader } from "@/components/ui/composite/layout";
import { FadeIn, StaggerContainer, StaggerItem, ScrollReveal } from "@/components/ui/composite/motion";
import type { VehicleCard } from "@/types";
import { ArrowRight, Shield, Award, Check, Star, MapPin, Sparkles, ThumbsUp, TrendingUp, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { WhyUsCards } from "@/components/public/why-us-cards";

export const metadata = {
  title: "AutoPrime | Concessionária de Veículos Premium & Seminovos de Luxo",
  description:
    "Encontre veículos premium seminovos com laudo cautelar, garantia de procedência e atendimento exclusivo. A melhor concessionária para o seu próximo carro.",
  openGraph: {
    title: "AutoPrime | Concessionária Premium",
    description: "Seminovos de luxo com garantia e procedência garantida.",
    url: "https://autoprime.com.br",
    siteName: "AutoPrime",
    locale: "pt_BR",
    type: "website",
  },
};

const getFeaturedVehicles = unstable_cache(
  async (): Promise<VehicleCard[]> => {
    const vehicles = await prisma.vehicle.findMany({
      where:   { status: "AVAILABLE", featured: true },
      take:    6,
      orderBy: { createdAt: "desc" },
      include: {
        brand:  { select: { name: true, slug: true } },
        model:  { select: { name: true, slug: true } },
        images: { where: { isCover: true }, take: 1 },
      },
    });
    return vehicles.map((v) => ({ ...v, price: Number(v.price) })) as VehicleCard[];
  },
  ['home-featured'],
  { revalidate: 60, tags: ['vehicles'] },
);

const getStats = unstable_cache(
  async () => {
    const [total, available, brands, sold] = await Promise.all([
      prisma.vehicle.count(),
      prisma.vehicle.count({ where: { status: "AVAILABLE" } }),
      prisma.brand.count({ where: { active: true } }),
      prisma.vehicle.count({ where: { status: "SOLD" } }),
    ]);
    return { total, available, brands, sold };
  },
  ['home-stats'],
  { revalidate: 60, tags: ['vehicles'] },
);

const getBrands = unstable_cache(
  async () => prisma.brand.findMany({
    where:   { active: true, vehicles: { some: { status: "AVAILABLE" } } },
    orderBy: { name: "asc" },
    include: { models: { where: { vehicles: { some: { status: "AVAILABLE" } } }, orderBy: { name: "asc" } } },
  }),
  ['home-brands'],
  { revalidate: 60, tags: ['vehicles'] },
);

const getRecentVehicles = unstable_cache(
  async (): Promise<VehicleCard[]> => {
    const vehicles = await prisma.vehicle.findMany({
      where:   { status: "AVAILABLE" },
      take:    6,
      orderBy: { createdAt: "desc" },
      include: {
        brand:  { select: { name: true, slug: true } },
        model:  { select: { name: true, slug: true } },
        images: { where: { isCover: true }, take: 1 },
      },
    });
    return vehicles.map((v) => ({ ...v, price: Number(v.price) })) as VehicleCard[];
  },
  ['home-recent'],
  { revalidate: 60, tags: ['vehicles'] },
);

export default async function HomePage() {
  const [featured, stats, brands, recent] = await Promise.all([
    getFeaturedVehicles(),
    getStats(),
    getBrands(),
    getRecentVehicles(),
  ]);

  const whatsapp = await getWhatsappNumber();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type":    "AutoDealer",
    "name":     "AutoPrime",
    "@id":      "https://autoprime.com.br",
    "url":      "https://autoprime.com.br",
    "telephone": `+${whatsapp}`,
    "address": {
      "@type":           "PostalAddress",
      "streetAddress":   "Av. Europa, 1000",
      "addressLocality": "São Paulo",
      "addressRegion":   "SP",
      "postalCode":      "01449-000",
      "addressCountry":  "BR",
    },
    "priceRange": "$$$$",
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <section
        className="relative min-h-screen flex items-center justify-center overflow-hidden"
        style={{ background: "#080d16" }}
      >
        {/* Background Image Layer */}
        <div 
          className="absolute inset-0 z-0 pointer-events-none"
          style={{
            backgroundImage: "url('/images/hero-car-bg.png')",
            backgroundSize: "contain",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            // Removemos o fundo branco e deixamos apenas o carro brilhando!
            filter: "invert(1) opacity(0.15)", 
            mixBlendMode: "screen",
          }}
        />

        {/* Content */}
        <div className="relative z-30 w-full">
          <div className="max-w-7xl mx-auto px-4 sm:px-8">
            <div className="flex flex-col items-center text-center py-36 lg:py-44">

              {/* Overline */}
              <FadeIn delay={0.2} direction="down">
                <div className="flex items-center gap-4 mb-8">
                  <span className="w-10 h-px" style={{ background: "rgba(218,37,29,0.5)" }} />
                  <span
                    className="text-[11px] font-bold uppercase tracking-[0.28em]"
                    style={{ color: "rgba(255,255,255,0.7)" }}
                  >
                    Premium Auto Dealership
                  </span>
                  <span className="w-10 h-px" style={{ background: "rgba(218,37,29,0.5)" }} />
                </div>
              </FadeIn>

              {/* Headline */}
              <FadeIn delay={0.35} direction="up">
                <h1
                  className="font-display text-5xl sm:text-7xl md:text-8xl mb-6 leading-[0.92] tracking-tight max-w-5xl mx-auto font-black"
                  style={{ color: "#f0f4f8", textShadow: "0 2px 40px rgba(0,0,0,0.5)" }}
                >
                  Seu próximo carro{" "}
                  <br className="hidden sm:block" />
                  <span
                    style={{
                      background: "linear-gradient(135deg, #DA251D 0%, #f03738 60%, #e47a88 100%)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                    }}
                  >
                    está aqui.
                  </span>
                </h1>
              </FadeIn>

              {/* Subheadline */}
              <FadeIn delay={0.5} direction="up">
                <p
                  className="max-w-2xl mx-auto mb-12 text-lg sm:text-xl leading-relaxed font-medium"
                  style={{ color: "rgba(255,255,255,0.7)" }}
                >
                  Seminovos premium com garantia de procedência, financiamento facilitado
                  e o melhor custo-benefício.
                </p>
              </FadeIn>

              {/* Stat pills */}
              <FadeIn
                delay={0.6}
                className="flex flex-wrap items-center justify-center gap-3 mb-12"
              >
                {[
                  { label: "Disponíveis",       value: stats.available, icon: <Shield size={13} /> },
                  { label: "Marcas",           value: stats.brands,    icon: <Award size={13} /> },
                  { label: "Clientes Felizes", value: stats.sold,icon: <ThumbsUp size={13} /> },
                ].map((stat, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 px-4 py-2 rounded-full text-[11px] font-semibold"
                    style={{
                      background: "rgba(255,255,255,0.08)",
                      backdropFilter: "blur(12px)",
                      border: "1px solid rgba(255,255,255,0.12)",
                      color: "#f0f4f8",
                    }}
                  >
                    <span style={{ color: "#DA251D" }}>{stat.icon}</span>
                    <span
                      className="font-black text-sm"
                      style={{ color: "#DA251D" }}
                    >
                      {stat.value}
                    </span>
                    <span style={{ opacity: 0.75 }}>{stat.label}</span>
                  </div>
                ))}
              </FadeIn>

              {/* Search */}
              <FadeIn delay={0.8} direction="up" className="w-full max-w-4xl mx-auto">
                <Suspense
                  fallback={
                    <div
                      className="h-40 rounded-2xl animate-pulse"
                      style={{ background: "rgba(255,255,255,0.05)" }}
                    />
                  }
                >
                  <HeroSearch brands={brands} />
                </Suspense>
              </FadeIn>
            </div>
          </div>
        </div>
      </section>

      <BrandStrip />

      {featured.length > 0 && (
        <section className="py-20 sm:py-28" style={{ background: "#0a0f1a" }}>
          <div
            className="w-full h-px mb-20"
            style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.05) 30%, rgba(255,255,255,0.05) 70%, transparent)" }}
          />
          <div className="max-w-7xl mx-auto px-4 sm:px-8">
            <FadeIn className="flex flex-col items-center text-center mb-14">
              <div
                className="flex items-center gap-2.5 px-4 py-2 rounded-full text-[11px] font-bold uppercase tracking-widest mb-5"
                style={{
                  background: "rgba(218,37,29,0.1)",
                  border: "1px solid rgba(218,37,29,0.2)",
                  color: "#DA251D",
                }}
              >
                <Sparkles size={13} />
                Destaques da Semana
              </div>
              <h2
                className="font-display text-3xl sm:text-5xl font-black tracking-tight mb-4"
                style={{ color: "#f0f4f8" }}
              >
                Ofertas{" "}
                <span
                  style={{
                    background: "linear-gradient(135deg, #DA251D, #f03738)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  Imperdíveis
                </span>
              </h2>
              <p className="max-w-md text-base" style={{ color: "#8899a6" }}>
                Veículos selecionados com as melhores condições especiais para você.
              </p>
            </FadeIn>

            {featured.length > 3 ? (
              <div className="relative">
                <div className="overflow-x-auto scrollbar-hide pb-4 -mx-4 px-4 sm:mx-0 sm:px-8 pr-8 sm:pr-0">
                  <div className="flex gap-5 sm:gap-6 min-w-max">
                    {featured.map((vehicle) => (
                      <div key={vehicle.id} className="flex-shrink-0 w-[300px] sm:w-[320px]">
                        <VehicleCardComponent vehicle={vehicle} />
                      </div>
                    ))}
                  </div>
                </div>
                <FadeIn direction="up" className="flex justify-center mt-10">
                  <Link
                    href="/veiculos?featured=true"
                    className="group inline-flex items-center gap-2.5 font-bold text-sm transition-colors duration-200"
                    style={{ color: "#DA251D" }}
                  >
                    Ver todos os destaques
                    <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </Link>
                </FadeIn>
              </div>
            ) : (
              <StaggerContainer className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
                {featured.map((vehicle) => (
                  <StaggerItem key={vehicle.id}>
                    <VehicleCardComponent vehicle={vehicle} />
                  </StaggerItem>
                ))}
              </StaggerContainer>
            )}

            {featured.length <= 3 && (
              <FadeIn direction="up" className="flex justify-center mt-12">
                <Link
                  href="/veiculos"
                  className="group inline-flex items-center gap-2.5 font-bold text-sm transition-colors duration-200"
                  style={{ color: "#DA251D" }}
                >
                  Ver todos os veículos
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </FadeIn>
            )}
          </div>
        </section>
      )}

      <section className="py-20 sm:py-28" style={{ background: "#080d16" }}>
        <div
          className="w-full h-px mb-20"
          style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.04) 30%, rgba(255,255,255,0.04) 70%, transparent)" }}
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">

            {/* Image */}
            <ScrollReveal className="order-2 lg:order-1 relative">
              <div
                className="aspect-[4/3] relative overflow-hidden rounded-2xl"
                style={{ border: "1px solid #1e2d42" }}
              >
                <Image
                  src="https://images.unsplash.com/photo-1552519507-da3b142c6e3d?q=80&w=1200&auto=format&fit=crop"
                  alt="Showroom AutoPrime"
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-700"
                />
                <div
                  className="absolute inset-0"
                  style={{ background: "linear-gradient(to top, rgba(8,13,22,0.6) 0%, transparent 60%)" }}
                />
              </div>

              {/* Floating badge */}
              <div
                className="absolute -bottom-5 -right-5 sm:-bottom-8 sm:-right-8 rounded-2xl p-5 sm:p-7 text-center z-10 shadow-[0_8px_40px_rgba(218,37,29,0.35)]"
                style={{ background: "linear-gradient(135deg, #f03738 0%, #c71b14 100%)" }}
              >
                <p
                  className="font-display font-black text-4xl sm:text-5xl lg:text-6xl mb-1"
                  style={{ color: "#ffffff" }}
                >
                  {stats.available}+
                </p>
                <p
                  className="text-[10px] uppercase font-bold tracking-widest leading-relaxed"
                  style={{ color: "rgba(255,255,255,0.85)" }}
                >
                  Veículos<br />Disponíveis
                </p>
              </div>
            </ScrollReveal>

            {/* Text */}
            <ScrollReveal className="order-1 lg:order-2">
              <p className="label-overline mb-5">Quem Somos</p>
              <h2
                className="font-display text-3xl sm:text-5xl font-black mb-8 leading-tight tracking-tight"
                style={{ color: "#f0f4f8" }}
              >
                O carro ideal para a sua rotina{" "}
                <span style={{ color: "#DA251D" }}>cabe no seu bolso.</span>
              </h2>
              <div
                className="space-y-4 text-base leading-relaxed mb-10 max-w-lg"
                style={{ color: "#8899a6" }}
              >
                <p>
                  Aqui você não precisa complicar. Temos as melhores taxas de financiamento e
                  pegamos o seu veículo usado como entrada. Nosso objetivo é garantir que você saia
                  de carro novo sem dores de cabeça.
                </p>
                <p>
                  Trabalhamos com os modelos mais populares do mercado: hatches econômicos, sedans
                  para a família, SUVs espaçosos e utilitários para o seu trabalho.
                </p>
              </div>

              {/* Trust features */}
              <div className="grid grid-cols-2 gap-3 mb-10">
                {[
                  { icon: <Shield size={16} />,    text: "Laudo Cautelar" },
                  { icon: <Award size={16} />,     text: "Garantia de Motor" },
                  { icon: <TrendingUp size={16} />,text: "Melhor Taxa" },
                  { icon: <Check size={16} />,     text: "Documentação OK" },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 text-sm font-semibold px-4 py-3 rounded-xl"
                    style={{
                      background: "#0e1623",
                      border: "1px solid #1e2d42",
                      color: "#f0f4f8",
                    }}
                  >
                    <span style={{ color: "#DA251D" }}>{item.icon}</span>
                    {item.text}
                  </div>
                ))}
              </div>

              <Link
                href="/sobre"
                className="group inline-flex items-center gap-2.5 font-bold text-sm px-8 py-4 rounded-xl transition-all duration-200"
                style={{
                  background: "#DA251D",
                  color: "#ffffff",
                  boxShadow: "0 4px 24px rgba(218,37,29,0.3)",
                }}
              >
                Conheça Nossa História
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </ScrollReveal>
          </div>
        </div>
      </section>

      <section className="py-20 sm:py-28" style={{ background: "#0a0f1a" }}>
        <div
          className="w-full h-px mb-20"
          style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.04) 30%, rgba(255,255,255,0.04) 70%, transparent)" }}
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="text-center mb-16">
            <div
              className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full text-[11px] font-bold uppercase tracking-widest mb-5"
              style={{
                background: "rgba(218,37,29,0.1)",
                border: "1px solid rgba(218,37,29,0.2)",
                color: "#DA251D",
              }}
            >
              Vantagens
            </div>
            <h2
              className="font-display text-3xl sm:text-5xl font-black tracking-tight mb-4"
              style={{ color: "#f0f4f8" }}
            >
              Por que comprar com a{" "}
              <span
                style={{
                  background: "linear-gradient(135deg, #DA251D, #f03738)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                gente?
              </span>
            </h2>
            <p className="max-w-lg mx-auto text-base" style={{ color: "#8899a6" }}>
              Oferecemos muito mais que veículos. Entregamos confiança e tranquilidade.
            </p>
          </div>

          <WhyUsCards />
        </div>
      </section>

      {recent.length > 0 && (
        <section className="py-20 sm:py-28" style={{ background: "#080d16" }}>
          <div
            className="w-full h-px mb-20"
            style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.04) 30%, rgba(255,255,255,0.04) 70%, transparent)" }}
          />
          <div className="max-w-7xl mx-auto px-4 sm:px-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-6">
              <FadeIn direction="up">
                <p className="label-overline mb-3">Acabaram de Chegar</p>
                <h2
                  className="font-display text-3xl sm:text-4xl font-black tracking-tight"
                  style={{ color: "#f0f4f8" }}
                >
                  Últimas{" "}
                  <span
                    style={{
                      background: "linear-gradient(135deg, #DA251D, #f03738)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                    }}
                  >
                    Unidades
                  </span>
                </h2>
              </FadeIn>

              <Link
                href="/veiculos"
                className="group inline-flex items-center gap-2 text-sm font-bold transition-colors duration-200"
                style={{ color: "#DA251D" }}
              >
                Ver Veículos
                <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            <StaggerContainer className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
              {recent.slice(0, 6).map((vehicle) => (
                <StaggerItem key={vehicle.id}>
                  <VehicleCardComponent vehicle={vehicle} />
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        </section>
      )}

      <section className="py-20 sm:py-28 bg-ink-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <ScrollReveal className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-widest bg-primary-500/10 border border-primary-500/20 text-primary-500 mb-6">
              <Star size={13} />
              Confiança
            </div>
            <h2 className="font-display text-3xl sm:text-5xl font-black mb-5 tracking-tight leading-tight text-ink-100">
              Transparência em{" "}
              <span className="text-primary-500"><br/>cada etapa.</span>
            </h2>
            <p className="text-base leading-relaxed max-w-2xl mx-auto text-ink-400">
              Trabalhamos com laudo cautelar, histórico veicular e financiamento facilitado para que você compre com segurança.
            </p> 
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              { icon: <Shield size={24} />, title: "Laudo Cautelar", desc: "Inspeção técnica completa em todos os veículos disponíveis." },
              { icon: <Award size={24} />, title: "Procedência", desc: "Histórico veicular documentado e origem verificada." },
              { icon: <TrendingUp size={24} />, title: "Financiamento", desc: "Simulação de crédito com múltiplos bancos parceiros." },
            ].map((item) => (
              <ScrollReveal key={item.title}>
                <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-ink-900 border border-ink-700 h-full">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-primary-500/10 text-primary-500 mb-4">
                    {item.icon}
                  </div>
                  <h3 className="font-bold text-ink-100 mb-2">{item.title}</h3>
                  <p className="text-sm text-ink-400">{item.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      <section
        className="relative py-24 sm:py-32 lg:py-40 overflow-hidden"
        id="contato"
        style={{
          backgroundImage: "url('/images/banner-oferta.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* Overlay escuro para garantir legibilidade */}
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(to right, rgba(10, 15, 26, 0.9) 0%, rgba(10, 15, 26, 0.7) 100%)" }}
        />
        
        {/* Overlay com a cor da marca (vermelho) */}
        <div
          className="absolute inset-0 mix-blend-multiply opacity-50"
          style={{ background: "linear-gradient(135deg, #DA251D 0%, transparent 100%)" }}
        />

        <div
          className="absolute top-0 left-0 w-96 h-96 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"
          style={{ background: "rgba(218,37,29,0.15)" }}
        />
        <div
          className="absolute bottom-0 right-0 w-80 h-80 rounded-full blur-3xl translate-x-1/3 translate-y-1/3"
          style={{ background: "rgba(0,0,0,0.5)" }}
        />

        <FadeIn
          direction="up"
          className="relative z-10 max-w-4xl mx-auto px-4 sm:px-8 text-center"
        >
          <div
            className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full text-[11px] font-bold uppercase tracking-widest mb-8"
            style={{
              background: "rgba(255,255,255,0.12)",
              border: "1px solid rgba(255,255,255,0.2)",
              color: "rgba(255,255,255,0.9)",
              backdropFilter: "blur(8px)",
            }}
          >
            <Sparkles size={13} />
            Oferta Exclusiva
          </div>

          <h2
            className="font-display text-4xl sm:text-6xl lg:text-7xl mb-6 leading-[1.02] font-black tracking-tight"
            style={{ color: "#ffffff" }}
          >
            Simule seu{" "}
            <span style={{ color: "#e02c2a" }}>financiamento </span>
            <br className="hidden sm:block" />
            agora mesmo
          </h2>

          <p
            className="mb-12 text-base sm:text-lg font-medium max-w-2xl mx-auto leading-relaxed"
            style={{ color: "rgba(255,255,255,0.75)" }}
          >
            Não perca tempo! Fale com nossos vendedores no WhatsApp e veja como é fácil
            sair de carro novo hoje.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-lg mx-auto">
            <Link
              href={`https://wa.me/${whatsapp}?text=${encodeURIComponent("Olá! Quero simular o financiamento de um carro.")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="group w-full flex items-center justify-center gap-3 font-bold uppercase text-[12px] rounded-xl transition-all duration-300 active:scale-[0.98] hover:-translate-y-1 hover:shadow-[0_12px_30px_rgba(255,255,255,0.3)] px-8 py-4"
              style={{
                background: "#ffffff",
                color: "#DA251D",
                boxShadow: "0 8px 32px rgba(0,0,0,0.25)",
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              Chamar no WhatsApp
            </Link>

            <Link
              href="/veiculos"
              className="group w-full flex items-center justify-center gap-2.5 font-bold uppercase text-[12px] rounded-xl transition-all duration-300 active:scale-[0.98] hover:-translate-y-1 hover:bg-white/10 hover:border-white/50 px-8 py-4"
              style={{
                border: "2px solid rgba(255,255,255,0.25)",
                color: "#ffffff",
                backdropFilter: "blur(8px)",
              }}
            >
              Ver Veículos
              <ArrowRight size={15} className="group-hover:translate-x-1.5 transition-transform" />
            </Link>
          </div>

          <div
            className="mt-14 flex flex-wrap items-center justify-center gap-6 sm:gap-12 text-[11px] font-bold uppercase tracking-widest"
            style={{ color: "rgba(255,255,255,0.55)" }}
          >
            <span className="flex items-center gap-2">
              <MapPin size={14} /> São Paulo, SP
            </span>
            <span className="hidden sm:block w-1 h-1 rounded-full" style={{ background: "rgba(255,255,255,0.25)" }} />
            <span className="flex items-center gap-2">
              <Shield size={14} /> Compra 100% Segura
            </span>
            <span className="hidden sm:block w-1 h-1 rounded-full" style={{ background: "rgba(255,255,255,0.25)" }} />
            <span className="flex items-center gap-2">
              <Check size={14} /> Entrega Rápida
            </span>
          </div>
        </FadeIn>
      </section>
    </>
  );
}
