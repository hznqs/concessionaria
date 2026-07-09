'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { ChevronDown } from 'lucide-react';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/base/accordion';

interface FAQItem {
  question: string;
  answer: string;
}

const defaultFAQs: FAQItem[] = [
  {
    question: 'Como funciona o processo de compra?',
    answer: 'Após manifestar interesse via WhatsApp ou formulário, nossa equipe verifica a disponibilidade, agenda a visita ao veículo, providencia o test drive eparta a documentação necessária. Aceitamos financiamento, consórcio e troca.',
  },
  {
    question: 'Posso financiar este veículo?',
    answer: 'Sim! Trabalhamos com os principais bancos e financeiras. Use nossa calculadora de financiamento para simular as condições (SAC ou Price) e depois fale com nosso consultor para aprovar seu crédito.',
  },
  {
    question: 'O veículo tem garantia?',
    answer: 'Todos os veículos AutoPrime com selo de qualidade incluem garantia de 3 meses para motor e câmbio. Adicionalmente, oferecibilidade de garantia estendida em até 12 meses (consulte valores).',
  },
  {
    question: 'Vocês aceitam meu carro como parte do pagamento?',
    answer: 'Sim! Fazemos avaliação gratuita do seu veículo atual e usamos o valor como entrada. Basta trazer o carro para uma avaliação técnica, e em 30 minutos você tem a proposta.',
  },
  {
    question: 'Como é feita a transferência e documentação?',
    answer: 'Toda a documentação é feita em nossa loja sem custos extras de despachante. O emplacamento e transferência são resolvidos pela nossa equipe, você só precisa fornecer seus documentos pessoais.',
  },
  {
    question: 'Que formas de pagamento são aceitas?',
    answer: 'À vista (PIX, transferência ou cheque), financiamento bancário, consórcio contemplado e troca com avaliação. Combine formas de pagamento com o consultor.',
  },
];

interface VehicleFAQProps {
  customFAQs?: FAQItem[];
}

export function VehicleFAQ({ customFAQs }: VehicleFAQProps) {
  const faqs = customFAQs ?? defaultFAQs;

  return (
    <section className="py-6">
      <h2 className="text-lg font-bold text-ink-900 dark:text-ink-100 mb-4">
        Perguntas frequentes
      </h2>
      <Accordion type="single" collapsible className="space-y-3">
        {faqs.map((faq, idx) => (
          <AccordionItem
            key={idx}
            value={`item-${idx}`}
            className="bg-white dark:bg-ink-900 rounded-xl border border-ink-200 dark:border-ink-700 px-4 [&[data-state=open]]:border-primary-300 dark:[&[data-state=open]]:border-primary-700"
          >
            <AccordionTrigger className="hover:no-underline py-4 text-left">
              <span className="flex items-center justify-between w-full">
                <span className="font-medium text-sm text-ink-900 dark:text-ink-100">{faq.question}</span>
                <ChevronDown className="h-4 w-4 text-ink-500 shrink-0 transition-transform data-[state=open]:rotate-180" />
              </span>
            </AccordionTrigger>
            <AccordionContent className="text-sm text-ink-600 dark:text-ink-400 leading-relaxed pb-4">
              {faq.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}