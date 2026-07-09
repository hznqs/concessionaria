"use client";

import React, { useState } from "react";
import { Loader2, CheckCircle, X } from "lucide-react";
import { formatPhone } from "@/lib/utils";

export default function ContatoForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorModal, setErrorModal] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");

  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate(): boolean {
    const errs: Record<string, string> = {};
    if (name.trim().length < 2) errs.name = "Nome deve ter pelo menos 2 caracteres";
    const digits = phone.replace(/\D/g, "");
    if (digits.length < 10) errs.phone = "Telefone inválido (mín. 10 dígitos)";
    if (email.trim()) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) errs.email = "E-mail inválido";
    }
    if (message.trim().length < 10) errs.message = "Mensagem deve ter pelo menos 10 caracteres";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-requested-by": "autoprime" },
        body: JSON.stringify({ name: name.trim(), email: email.trim() || null, whatsapp: phone, message: message.trim() }),
      });
      if (!res.ok) throw new Error("Erro ao salvar lead");
      setIsSuccess(true);
    } catch {
      setErrorModal("Ocorreu um erro ao enviar sua mensagem. Verifique sua conexão e tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center space-y-4 bg-ink-950/40 rounded-2xl border border-white/5 animate-in fade-in zoom-in duration-500">
        <div className="w-16 h-16 bg-primary-500/20 rounded-full flex items-center justify-center text-primary-500 mb-2">
          <CheckCircle size={32} />
        </div>
        <h3 className="text-2xl font-bold text-white">Mensagem Enviada!</h3>
        <p className="text-ink-400 max-w-xs mx-auto">
          Agradecemos o seu contato. Nossa equipe analisará sua mensagem e responderá o mais breve possível.
        </p>
        <button
          onClick={() => {
            setIsSuccess(false);
            setName("");
            setEmail("");
            setPhone("");
            setMessage("");
          }}
          className="mt-6 text-[10px] uppercase tracking-[0.2em] text-primary-500 hover:text-primary-400 font-bold transition-colors"
        >
          Enviar nova mensagem
        </button>
      </div>
    );
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit} noValidate>
      <div>
        <label htmlFor="name" className="block text-[10px] uppercase tracking-[0.2em] text-ink-400 mb-2">Qual o seu nome?</label>
        <input
          type="text"
          id="name"
          name="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full bg-ink-950 border border-white/10 rounded-xl px-4 py-4 text-sm text-white focus:outline-none focus:border-primary-500 transition-colors"
          placeholder="Seu nome completo"
        />
        {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="email" className="block text-[10px] uppercase tracking-[0.2em] text-ink-400 mb-2">E-mail</label>
          <input
            type="email"
            id="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-ink-950 border border-white/10 rounded-xl px-4 py-4 text-sm text-white focus:outline-none focus:border-primary-500 transition-colors"
            placeholder="seu.email@exemplo.com"
          />
          {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
        </div>
        <div>
          <label htmlFor="phone" className="block text-[10px] uppercase tracking-[0.2em] text-ink-400 mb-2">Telefone</label>
          <input
            type="tel"
            id="phone"
            name="phone"
            maxLength={15}
            value={phone}
            onChange={(e) => setPhone(formatPhone(e.target.value))}
            required
            className="w-full bg-ink-950 border border-white/10 rounded-xl px-4 py-4 text-sm text-white focus:outline-none focus:border-primary-500 transition-colors"
            placeholder="(00) 00000-0000"
          />
          {errors.phone && <p className="text-red-400 text-xs mt-1">{errors.phone}</p>}
        </div>
      </div>

      <div>
        <label htmlFor="message" className="block text-[10px] uppercase tracking-[0.2em] text-ink-400 mb-2">Em que podemos lhe ajudar?</label>
        <textarea
          id="message"
          name="message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
          rows={4}
          className="w-full bg-ink-950 border border-white/10 rounded-xl px-4 py-4 text-sm text-white focus:outline-none focus:border-primary-500 transition-colors resize-none"
          placeholder="Conte-nos o que você procura..."
        ></textarea>
        {errors.message && <p className="text-red-400 text-xs mt-1">{errors.message}</p>}
      </div>

      <div className="flex items-start gap-3 pt-2">
        <div className="flex items-center h-5">
          <input
            id="consent"
            name="consent"
            type="checkbox"
            required
            className="w-4 h-4 bg-ink-950 border border-white/10 rounded checked:bg-primary-500 checked:border-primary-500 focus:ring-1 focus:ring-primary-500 appearance-none relative
            checked:after:content-[''] checked:after:absolute checked:after:left-[5px] checked:after:top-[2px] checked:after:w-[5px] checked:after:h-[9px] checked:after:border-r-2 checked:after:border-b-2 checked:after:border-ink-950 checked:after:rotate-45"
          />
        </div>
        <label htmlFor="consent" className="text-xs text-ink-400 font-light leading-tight">
          Li e concordo em receber comunicações da AutoPrime sobre novidades, eventos exclusivos e ofertas personalizadas.
        </label>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full flex justify-center items-center gap-2 bg-primary-500 hover:bg-primary-400 text-ink-950 px-8 py-4 text-[10px] uppercase tracking-[0.3em] font-bold rounded-xl transition-all duration-300 mt-4 disabled:opacity-70"
      >
        {isSubmitting ? (
          <><Loader2 size={16} className="animate-spin" /> Processando...</>
        ) : (
          "Enviar Mensagem"
        )}
      </button>

      {/* Pop-up de erro customizado */}
      {errorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-ink-950 border border-white/10 rounded-2xl p-6 w-full max-w-sm text-center shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <X size={24} />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Erro no Envio</h3>
            <p className="text-sm text-ink-400 mb-6">{errorModal}</p>
            <button 
              type="button"
              onClick={() => setErrorModal(null)}
              className="w-full bg-white/10 hover:bg-white/20 text-white font-medium py-3 rounded-xl transition-colors"
            >
              Tentar Novamente
            </button>
          </div>
        </div>
      )}
    </form>
  );
}