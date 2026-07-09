import type { Metadata } from "next";
import Link from "next/link";
import { Mail, Phone, MapPin, Clock } from "lucide-react";
import ContatoForm from "@/components/public/contato-form";
import { getCompanySettings, getWhatsappNumber } from "@/lib/settings";

export const metadata: Metadata = {
  title: "Contato | AutoPrime",
  description: "Fale com nossa equipe de contato e inicie sua experiência AutoPrime.",
};

export default async function ContatoPage() {
  const company = await getCompanySettings();
  const whatsapp = await getWhatsappNumber();

  const contactJsonLd = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    name: "Contato - AutoPrime",
    description: "Fale com a equipe AutoPrime.",
    mainEntity: {
      "@type": "Organization",
      name: "AutoPrime",
      telephone: `+${whatsapp}`,
      email: company.email,
      contactPoint: {
        "@type": "ContactPoint",
        contactType: "sales",
        areaServed: "BR",
        availableLanguage: ["Portuguese"],
      },
    },
  };

  const hoursParts = [
    company.hoursWeekday ? `Segunda a Sexta: ${company.hoursWeekday}` : null,
    company.hoursSaturday ? `Sábado: ${company.hoursSaturday}` : null,
    company.hoursSunday && company.hoursSunday !== "Fechado" ? `Domingo: ${company.hoursSunday}` : null,
  ].filter(Boolean);

  return (
    <div className="bg-ink-950 min-h-screen pt-32 pb-24">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(contactJsonLd) }}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        
        {/* Page title */}
        <div className="mb-16 border-b border-white/5 pb-8 text-center sm:text-left">
          <p className="text-primary-500 text-[10px] font-bold uppercase tracking-[0.3em] mb-4 flex items-center justify-center sm:justify-start gap-4">
            <span className="w-12 h-px bg-primary-500" />
            Contato
          </p>
          <h1 className="font-display text-4xl sm:text-6xl text-white mb-4 leading-tight">
            Fale com a nossa <span className="italic font-light text-ink-500">equipe</span>
          </h1>
          <p className="text-ink-400 text-sm font-light tracking-wide max-w-2xl">
            Estamos à disposição para entender suas necessidades e apresentar o veículo perfeito para o seu estilo de vida.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">
          {/* Form */}
          <div className="order-2 lg:order-1">
            <div className="bg-ink-900 border border-white/5 p-8 sm:p-12">
              <h2 className="font-display text-3xl text-white mb-2">Como podemos lhe ajudar?</h2>
              <p className="text-ink-400 text-sm font-light tracking-wide mb-8">Preencha os dados abaixo e nossa equipe de contato falará com você.</p>

              <ContatoForm />
            </div>
          </div>

          {/* Contact Info */}
          <div className="order-1 lg:order-2 flex flex-col justify-center">
            <h3 className="font-display text-3xl text-white mb-8">Informações de Contato</h3>
            
            <ul className="space-y-8 mb-12">
              <li className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-none border border-primary-500/20 flex items-center justify-center shrink-0">
                  <Phone size={18} className="text-primary-500" />
                </div>
                <div>
                  <h4 className="text-white text-sm uppercase tracking-widest font-bold mb-1">Telefone Principal</h4>
                  <p className="text-ink-400 font-light text-sm">{company.phone || "(11) 99999-0000"}</p>
                </div>
              </li>
              
              <li className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-none border border-primary-500/20 flex items-center justify-center shrink-0">
                  <Mail size={18} className="text-primary-500" />
                </div>
                <div>
                  <h4 className="text-white text-sm uppercase tracking-widest font-bold mb-1">E-mail</h4>
                  <p className="text-ink-400 font-light text-sm">{company.email}</p>
                </div>
              </li>

              <li className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-none border border-primary-500/20 flex items-center justify-center shrink-0">
                  <Clock size={18} className="text-primary-500" />
                </div>
                <div>
                  <h4 className="text-white text-sm uppercase tracking-widest font-bold mb-1">Horário de Atendimento</h4>
                  <p className="text-ink-400 font-light text-sm">
                    {hoursParts.length > 0 ? hoursParts.map((p, i) => <span key={i}>{p}{i < hoursParts.length - 1 ? <br /> : null}</span>) : "Segunda a Sexta: 08h às 18h<br/>Sábado: 09h às 14h"}
                  </p>
                </div>
              </li>
            </ul>

            <div className="bg-ink-900 border border-white/5 p-8 text-center">
              <MapPin size={24} className="text-primary-500 mx-auto mb-4" />
              <h4 className="text-white font-display text-2xl mb-2">Visite nossas unidades</h4>
              <p className="text-ink-400 font-light text-sm mb-6">Conheça nossos showrooms presenciais e veja o acervo de perto.</p>
              <Link href="/unidades" className="btn-outline inline-block px-8 py-3">
                Ver Unidades
              </Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
