"use client";

import Link from "next/link";
import { MapPin, Phone, Mail, Clock, Instagram, Facebook, Youtube } from "lucide-react";
import { useSettings } from "@/lib/settings-context";
import { cn } from "@/lib/utils";

function formatPhoneDigits(digits: string): string {
  const d = digits.replace(/\D/g, "").replace(/^55/, "");
  if (d.length === 11) return `(${d.slice(0,2)}) ${d.slice(2,7)}-${d.slice(7)}`;
  if (d.length === 10) return `(${d.slice(0,2)}) ${d.slice(2,6)}-${d.slice(6)}`;
  return digits;
}

const DEFAULT_COMPANY = {
  name: "AutoPrime",
  cnpj: "",
  address: "Av. Europa, 1000",
  city: "São Paulo",
  state: "SP",
  email: "contato@autoprime.com.br",
  about:
    "Veículos premium com transparência, qualidade e atendimento exclusivo. A verdadeira definição de excelência automotiva.",
  hoursWeekday: "08h às 18h",
  hoursSaturday: "09h às 14h",
  hoursSunday: "Fechado",
  instagram: "",
  facebook: "",
  youtube: "",
};

const NAV_LINKS = [
  { label: "Veículos", href: "/veiculos" },
  { label: "Unidades",         href: "/unidades" },
  { label: "Sobre Nós",        href: "/sobre" },
  { label: "Venda seu Carro",  href: "/venda" },
];

export default function PublicFooter() {
  const { whatsappNumber, company, loaded } = useSettings();

  const phoneFormatted = formatPhoneDigits(whatsappNumber);

  const addressLine = [
    company.address ?? DEFAULT_COMPANY.address,
    company.city ?? DEFAULT_COMPANY.city,
    company.state ?? DEFAULT_COMPANY.state,
  ].filter(Boolean).join(", ");

  const email = company.email ?? DEFAULT_COMPANY.email;
  const about = company.about ?? DEFAULT_COMPANY.about;
  const cnpj = company.cnpj ?? DEFAULT_COMPANY.cnpj;

  const SOCIALS = [
    { Icon: Instagram, href: company.instagram, label: "Instagram" },
    { Icon: Facebook,  href: company.facebook,  label: "Facebook" },
    { Icon: Youtube,   href: company.youtube,   label: "YouTube" },
  ].filter((s): s is { Icon: typeof Instagram; href: string; label: string } => Boolean(s.href));

  const HOURS = [
    { day: "Seg–Sex", time: company.hoursWeekday ?? DEFAULT_COMPANY.hoursWeekday },
    { day: "Sábado",  time: company.hoursSaturday ?? DEFAULT_COMPANY.hoursSaturday },
    { day: "Domingo", time: company.hoursSunday ?? DEFAULT_COMPANY.hoursSunday },
  ];
  const isClosed = (t: string) => /fechado/i.test(t.trim());

  return (
    <footer className="pt-16 sm:pt-20 pb-8 bg-ink-950 border-t border-white/5">
      <div className="w-full h-px mb-16 sm:mb-20 max-w-7xl mx-auto px-4 sm:px-8 bg-gradient-to-r from-transparent via-primary-500/40 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 sm:gap-14 lg:gap-16 mb-16 sm:mb-20">

          <div className="lg:col-span-1" style={{ minHeight: loaded ? undefined : '200px' }}>
            <Link href="/" className="flex items-center group mb-5">
              <span className="font-display uppercase tracking-[0.3em] text-sm font-light text-ink-100">
                Auto
                <span className="font-black text-primary-500">Prime</span>
              </span>
            </Link>
            {!loaded ? (
              <div className="space-y-3 animate-pulse">
                <div className="h-4 bg-ink-800 rounded w-3/4" />
                <div className="h-4 bg-ink-800 rounded w-1/2" />
                <div className="h-4 bg-ink-800 rounded w-2/3" />
              </div>
            ) : (
              <p className="text-[13px] font-light leading-relaxed tracking-wide mb-6 text-ink-500">
                {about}
              </p>
            )}

            {loaded && SOCIALS.length > 0 && (
            <div className="flex items-center gap-3" style={{ minHeight: '36px' }}>
              {SOCIALS.map(({ Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="w-9 h-9 rounded-xl flex items-center justify-center bg-ink-900 border border-ink-700 transition-all duration-200 hover:border-primary-500/50 hover:bg-primary-500/10"
                >
                  <Icon size={15} className="text-ink-500" />
                </a>
              ))}
            </div>
            )}
          </div>

          <div>
            <h4 className="font-display text-[11px] tracking-[0.25em] uppercase mb-6 font-bold text-ink-100">
              Acervo
            </h4>
            <ul className="space-y-3">
              {NAV_LINKS.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-[13px] font-light tracking-wide transition-colors duration-200 block py-1 text-ink-500 hover:text-ink-100"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-display text-[11px] tracking-[0.25em] uppercase mb-6 font-bold text-ink-100">
              Contato
            </h4>
            {!loaded ? (
              <ul className="space-y-4 animate-pulse">
                {[1, 2, 3].map((i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className="w-3.5 h-3.5 bg-ink-800 rounded shrink-0 mt-1" />
                    <div className="h-4 bg-ink-800 rounded w-2/3" />
                  </li>
                ))}
              </ul>
            ) : (
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin size={14} className="text-primary-500 mt-[2px] shrink-0" />
                <span className="text-[13px] font-light leading-relaxed text-ink-500">
                  {addressLine}
                </span>
              </li>
              <li>
                <a
                  href={`https://wa.me/${whatsappNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-[13px] font-light text-ink-500 hover:text-ink-100 transition-colors"
                >
                  <Phone size={14} className="text-primary-500 shrink-0" />
                  {phoneFormatted}
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${email}`}
                  className="flex items-center gap-3 text-[13px] font-light text-ink-500 hover:text-ink-100 transition-colors"
                >
                  <Mail size={14} className="text-primary-500 shrink-0" />
                  {email}
                </a>
              </li>
            </ul>
            )}
          </div>

          <div>
            <h4 className="font-display text-[11px] tracking-[0.25em] uppercase mb-6 font-bold text-ink-100">
              Horário
            </h4>
            {!loaded ? (
              <ul className="space-y-4 animate-pulse">
                {[1, 2, 3].map((i) => (
                  <li key={i} className="flex items-center gap-3">
                    <div className="w-3.5 h-3.5 bg-ink-800 rounded shrink-0" />
                    <div className="h-4 bg-ink-800 rounded w-1/2" />
                  </li>
                ))}
              </ul>
            ) : (
            <ul className="space-y-4">
              {HOURS.map((h) => (
                <li key={h.day} className="flex items-center gap-3">
                  <Clock size={14} className={cn("shrink-0", isClosed(h.time) ? "text-ink-700" : "text-primary-500")} />
                  <div>
                    <p className={cn("text-[13px] font-medium", isClosed(h.time) ? "text-ink-700" : "text-ink-400")}>{h.day}</p>
                    <p className={cn("text-[13px] font-light", isClosed(h.time) ? "text-ink-700" : "text-ink-500")}>{h.time}</p>
                  </div>
                </li>
              ))}
            </ul>
            )}
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-white/[0.04]">
          <p className="text-[10px] tracking-[0.2em] uppercase font-bold text-ink-700">
            © {new Date().getFullYear()} AutoPrime. All rights reserved.
          </p>
          {cnpj && (
            <p className="text-[10px] tracking-[0.15em] font-medium text-ink-600 order-first sm:order-none">
              CNPJ: {cnpj}
            </p>
          )}
          <div className="flex items-center gap-4">
            <Link href="/privacidade" className="text-[10px] tracking-[0.15em] uppercase font-bold text-ink-700 hover:text-ink-400 transition-colors">
              Privacidade
            </Link>
            <span className="text-ink-800">·</span>
            <p className="text-[10px] tracking-[0.15em] uppercase font-bold text-ink-700">
              AutoPrime Seminovos
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
