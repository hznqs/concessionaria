"use client";

import { Check, Shield, Award, Headphones } from "lucide-react";
import { StaggerContainer, StaggerItem } from "@/components/ui/composite/motion";

const items = [
  {
    icon:     <Shield size={28} />,
    title:    "Veículos Revisados",
    desc:     "Todos os nossos carros passam por uma rigorosa revisão mecânica para você rodar com segurança.",
    items:    ["Checklist de 150 pontos", "Laudo cautelar incluso", "Garantia de 12 meses"],
    featured: false,
  },
  {
    icon:     <Award size={28} />,
    title:    "Garantia de Loja",
    desc:     "Tranquilidade total. Oferecemos garantia de motor e câmbio para todos os veículos do estoque.",
    items:    ["Garantia de motor e câmbio", "Assistência 24h", "Revisão gratuita"],
    featured: true,
  },
  {
    icon:     <Headphones size={28} />,
    title:    "Atendimento Premium",
    desc:     "Nossa equipe está pronta para atender você pessoalmente ou pelo WhatsApp em poucos minutos.",
    items:    ["Consultor exclusivo", "Simulação online", "Test-drive agendado"],
    featured: false,
  },
];

export function WhyUsCards() {
  return (
    <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {items.map((item, idx) => (
        <StaggerItem key={idx} direction="up">
          <div
            className="group flex flex-col h-full rounded-2xl p-8 cursor-default"
            style={{
              background: item.featured ? "rgba(218,37,29,0.06)" : "#0e1623",
              border: item.featured ? "1px solid rgba(218,37,29,0.25)" : "1px solid #1e2d42",
              transition: "border-color 0.25s ease, transform 0.25s ease",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = "rgba(218,37,29,0.4)";
              (e.currentTarget as HTMLElement).style.transform = "translateY(-3px)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = item.featured
                ? "rgba(218,37,29,0.25)"
                : "#1e2d42";
              (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
            }}
          >
            {/* Icon */}
            <div
              className="w-14 h-14 rounded-xl flex items-center justify-center mb-7"
              style={{
                background: "rgba(218,37,29,0.12)",
                border: "1px solid rgba(218,37,29,0.2)",
                color: "#DA251D",
              }}
            >
              {item.icon}
            </div>

            <h3
              className="font-display text-xl font-bold mb-3"
              style={{ color: "#f0f4f8" }}
            >
              {item.title}
            </h3>
            <p
              className="text-sm leading-relaxed mb-6"
              style={{ color: "#8899a6" }}
            >
              {item.desc}
            </p>

            <ul className="space-y-3 mt-auto">
              {item.items.map((sub, i) => (
                <li key={i} className="flex items-center gap-3 text-sm font-medium" style={{ color: "#8899a6" }}>
                  <span
                    className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                    style={{ background: "rgba(34,197,94,0.15)", border: "1px solid rgba(34,197,94,0.25)" }}
                  >
                    <Check size={11} style={{ color: "#22c55e" }} />
                  </span>
                  {sub}
                </li>
              ))}
            </ul>
          </div>
        </StaggerItem>
      ))}
    </StaggerContainer>
  );
}
