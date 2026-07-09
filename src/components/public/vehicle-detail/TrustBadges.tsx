'use client';

import { ShieldCheck, BadgeCheck, FileCheck, Wrench, Clock, Award } from 'lucide-react';
import { cn } from '@/lib/utils';

const trustItems = [
  { icon: ShieldCheck, title: 'Vistoria 200+ pontos', description: 'Inspeção completa mecânica, elétrica e estrutural' },
  { icon: BadgeCheck, title: 'Procedência garantida', description: 'Histórico do veículo verificado e laudo cautelar' },
  { icon: FileCheck, title: 'Documentação em dia', description: 'Liquidação e transferência sem burocracia' },
  { icon: Wrench, title: 'Revisão incluída', description: 'Revisão básica gratuitamente na compra' },
  { icon: Clock, title: 'Garantia estendida', description: '3 meses de garantia motor e câmbio' },
  { icon: Award, title: 'Selo AutoPrime', description: 'Qualidade premium certificada AutoPrime' },
];

export function TrustBadges() {
  return (
    <section className="py-6">
      <h2 className="text-lg font-bold text-ink-900 dark:text-ink-100 mb-4 text-center">
        Compre com segurança
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {trustItems.map((item) => (
          <div
            key={item.title}
            className={cn(
              'group relative bg-white dark:bg-ink-900 rounded-xl p-4',
              'border border-ink-200 dark:border-ink-700',
              'hover:shadow-md transition-all hover:-translate-y-0.5'
            )}
          >
            <div className="flex flex-col items-center text-center gap-2 cursor-help">
              <div className="p-2.5 rounded-full bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 group-hover:scale-110 transition-transform">
                <item.icon className="h-6 w-6" />
              </div>
              <h3 className="text-sm font-semibold text-ink-900 dark:text-ink-100">{item.title}</h3>
              <p className="text-xs text-ink-500 dark:text-ink-400 leading-relaxed">{item.description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}