import type { Metadata } from "next";
const orgJsonLd = { "@context": "https://schema.org", "@type": "Organization", name: "AutoPrime", description: "Concessionaria de veiculos premium e seminovos.", url: process.env.NEXT_PUBLIC_APP_URL ?? "https://autoprime.com.br" };
import Image from "next/image";
import { Shield, Award, Headphones } from "lucide-react";

export const metadata: Metadata = {
  title: "Sobre Nós | AutoPrime",
  description: "Conheça a história e os pilares de excelência da AutoPrime.",
};

export default function SobrePage() {
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }} />
  return (
    <div className="bg-ink-950 min-h-screen pt-24 sm:pt-32 pb-16 sm:pb-24">
      {/* Hero Sobre */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 mb-24 sm:mb-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 sm:gap-16 lg:gap-24 items-center">
          
          <div className="order-2 lg:order-1 relative">
            <div className="aspect-[4/3] sm:aspect-[3/4] relative bg-ink-900 overflow-hidden border border-white/5">
              <Image
                src="https://images.unsplash.com/photo-1552519507-da3b142c6e3d?q=80&w=1200&auto=format&fit=crop"
                alt="Showroom Exclusivo AutoPrime"
                fill
                className="object-cover grayscale hover:grayscale-0 transition-all duration-1000 scale-100 hover:scale-105"
              />
            </div>
            {/* Decoração Luxury */}
            <div className="absolute -bottom-8 sm:-bottom-10 -right-6 sm:-right-10 w-48 sm:w-64 h-48 sm:h-64 bg-ink-950 border border-primary-500/20 flex flex-col items-center justify-center p-6 sm:p-8 text-center hidden sm:flex">
              <span className="font-display text-4xl sm:text-5xl text-primary-400 mb-3 sm:mb-4 tracking-tighter">1998</span>
              <span className="text-[8px] sm:text-[9px] uppercase tracking-[0.3em] text-ink-400 font-bold">Desde o princípio,<br/>a excelência.</span>
            </div>
          </div>

          <div className="order-1 lg:order-2">
            <p className="text-primary-500 text-[10px] font-bold uppercase tracking-[0.3em] mb-6 flex items-center gap-4">
              <span className="w-8 sm:w-12 h-px bg-primary-500" />
              Nossa História
            </p>
            <h1 className="font-display text-3xl sm:text-5xl lg:text-6xl text-white mb-8 sm:mb-10 leading-tight">
              O ápice do <br />
              <span className="italic font-light text-ink-500">mercado premium.</span>
            </h1>
            
            <div className="space-y-5 sm:space-y-6 text-sm text-ink-400 leading-relaxed tracking-wide font-light">
              <p>
                A AutoPrime nasceu da paixão por automóveis de alta performance e do desejo de oferecer uma experiência de compra incomparável no Brasil. Não somos apenas uma concessionária; somos curadores de obras de arte automotivas.
              </p>
              <p>
                Cada veículo que entra em nosso showroom passa por um processo rigoroso de seleção. Analisamos histórico, procedência, estrutura e mecânica com o mais alto grau de exigência. Se não serve para a nossa coleção particular, não serve para você.
              </p>
              <p>
                Nosso compromisso é com a transparência absoluta e com a sua tranquilidade. Desde a primeira visita até a entrega técnica, você sentirá a diferença do padrão AutoPrime.
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* Pilares */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="font-display text-2xl sm:text-3xl lg:text-5xl text-white mb-6">
            Por que escolher a <span className="italic font-light text-ink-500">AutoPrime?</span>
          </h2>
          <div className="w-px h-12 sm:h-16 bg-primary-500/30 mx-auto" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-px bg-white/5 border border-white/5">
          {[
            {
              icon:  <Shield size={24} className="text-primary-400" />,
              title: "Laudo Cautelar 100%",
              desc:  "Aprovação máxima. Todos os carros são periciados por empresas terceirizadas líderes no mercado, garantindo originalidade e integridade.",
            },
            {
              icon:  <Award size={24} className="text-primary-400" />,
              title: "Procedência Garantida",
              desc:  "Documentação cristalina e histórico de manutenções comprovado. Selecionamos apenas veículos impecáveis.",
            },
            {
              icon:  <Headphones size={24} className="text-primary-400" />,
              title: "Atendimento VIP",
              desc:  "Assessoria completa e personalizada. Entendemos seu estilo de vida para encontrar o veículo que se encaixa perfeitamente a você.",
            },
          ].map((item, idx) => (
            <div key={idx} className="bg-ink-950 p-8 sm:p-12 text-center group hover:bg-ink-900 transition-colors duration-500 flex flex-col items-center">
              <div className="inline-flex items-center justify-center w-14 sm:w-16 h-14 sm:h-16 border border-primary-500/20 mb-6 sm:mb-8 group-hover:border-primary-500 transition-colors">
                {item.icon}
              </div>
              <h3 className="font-display text-xl sm:text-2xl text-white mb-4">{item.title}</h3>
              <p className="text-ink-400 text-sm leading-relaxed font-light max-w-xs">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
