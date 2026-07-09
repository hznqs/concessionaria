import type { Metadata } from "next";
import { UploadCloud, CheckCircle2, DollarSign } from "lucide-react";
import VendaForm from "@/components/public/venda-form";

export const metadata: Metadata = {
  title: "Venda seu Carro | AutoPrime",
  description: "Avaliação justa e segura para o seu veículo premium.",
};

export default function VendaPage() {
  return (
    <div className="bg-ink-950 min-h-screen pt-32 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        
        {/* Page title */}
        <div className="mb-16 border-b border-white/5 pb-8 text-center sm:text-left">
          <p className="text-primary-500 text-[10px] font-bold uppercase tracking-[0.3em] mb-4 flex items-center justify-center sm:justify-start gap-4">
            <span className="w-12 h-px bg-primary-500" />
            Consignação & Compra
          </p>
          <h1 className="font-display text-4xl sm:text-6xl text-white mb-4 leading-tight">
            Venda o seu <span className="italic font-light text-ink-500">veículo</span>
          </h1>
          <p className="text-ink-400 text-sm font-light tracking-wide max-w-2xl">
            Compramos ou consignamos o seu carro premium. Processo transparente, avaliação criteriosa e pagamento seguro.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24">
          
          {/* Form */}
          <div className="lg:col-span-7">
            <div className="bg-ink-900 border border-white/5 p-8 sm:p-12">
              <h2 className="font-display text-2xl text-white mb-8">Dados do Veículo</h2>

              <VendaForm />
            </div>
          </div>

          {/* Benefits Info */}
          <div className="lg:col-span-5 flex flex-col pt-8 lg:pt-0">
            <div className="sticky top-32">
              <h3 className="font-display text-3xl text-white mb-8">O Padrão AutoPrime</h3>
              
              <ul className="space-y-10">
                <li className="flex items-start gap-5">
                  <div className="w-12 h-12 rounded-none bg-ink-900 border border-primary-500/20 flex items-center justify-center shrink-0">
                    <CheckCircle2 size={20} className="text-primary-500" />
                  </div>
                  <div>
                    <h4 className="text-white text-sm uppercase tracking-widest font-bold mb-2">Avaliação Justa e Rápida</h4>
                    <p className="text-ink-400 font-light text-sm leading-relaxed">Nossa equipe de especialistas analisa o mercado em tempo real para oferecer a melhor proposta pelo seu veículo, considerando acessórios e estado de conservação.</p>
                  </div>
                </li>
                
                <li className="flex items-start gap-5">
                  <div className="w-12 h-12 rounded-none bg-ink-900 border border-primary-500/20 flex items-center justify-center shrink-0">
                    <DollarSign size={20} className="text-primary-500" />
                  </div>
                  <div>
                    <h4 className="text-white text-sm uppercase tracking-widest font-bold mb-2">Pagamento à Vista</h4>
                    <p className="text-ink-400 font-light text-sm leading-relaxed">Na modalidade de compra, garantimos a transferência imediata e segura dos valores assim que a documentação for aprovada e o laudo cautelar validado.</p>
                  </div>
                </li>

                <li className="flex items-start gap-5">
                  <div className="w-12 h-12 rounded-none bg-ink-900 border border-primary-500/20 flex items-center justify-center shrink-0">
                    <CheckCircle2 size={20} className="text-primary-500" />
                  </div>
                  <div>
                    <h4 className="text-white text-sm uppercase tracking-widest font-bold mb-2">Consignação Exclusiva</h4>
                    <p className="text-ink-400 font-light text-sm leading-relaxed">Se preferir consignar, seu carro ganha destaque em nosso showroom, com fotos profissionais e apresentação para nossa carteira VIP de clientes, maximizando o valor de venda.</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
