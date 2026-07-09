"use client";

import React, { useState, useRef } from "react";
import { UploadCloud, X, Image as ImageIcon, Loader2 } from "lucide-react";
import { useSettings } from "@/lib/settings-context";
import { formatPhone } from "@/lib/utils";

export default function VendaForm() {
  const { whatsappNumber } = useSettings();
  const [files, setFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState("");
  const [km, setKm] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate(): boolean {
    const errs: Record<string, string> = {};
    if (brand.trim().length < 1) errs.brand = "Informe a marca";
    if (model.trim().length < 1) errs.model = "Informe o modelo";
    if (year.trim().length < 4) errs.year = "Informe o ano";
    if (km.trim().length < 1) errs.km = "Informe a quilometragem";
    if (name.trim().length < 2) errs.name = "Nome deve ter pelo menos 2 caracteres";
    const digits = phone.replace(/\D/g, "");
    if (digits.length < 10) errs.phone = "Telefone inválido (mín. 10 dígitos)";
    if (email.trim()) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) errs.email = "E-mail inválido";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles((prev) => [...prev, ...newFiles]);
    }
  };

  const removeFile = (indexToRemove: number) => {
    setFiles((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);

    const photosInfo = files.length > 0
      ? `\n\n*Imagens:* O cliente selecionou ${files.length} foto(s) no site. (Por favor, envie as fotos a seguir nesta conversa).`
      : "";

    const text = `*Solicitação de Avaliação (Venda/Consignação)*\n\n*Dados do Veículo:*\nMarca: ${brand.trim()}\nModelo/Versão: ${model.trim()}\nAno: ${year.trim()}\nKm: ${km.trim()}\n\n*Dados do Cliente:*\nNome: ${name.trim()}\nE-mail: ${email.trim()}\nTelefone/WhatsApp: ${phone}${photosInfo}`;
    const waUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(text)}`;

    window.open(waUrl, "_blank");
    setIsSubmitting(false);
  };

  const inputClass = "w-full bg-ink-950 border border-white/10 rounded-xl px-4 py-4 text-sm text-white focus:outline-none focus:border-primary-500 transition-colors";

  return (
    <form className="space-y-8" onSubmit={handleSubmit} noValidate>
      {/* Vehicle Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="brand" className="block text-[10px] uppercase tracking-[0.2em] text-ink-400 mb-2">Marca</label>
          <input
            type="text"
            id="brand"
            name="brand"
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
            required
            className={inputClass}
            placeholder="Ex: Porsche"
          />
          {errors.brand && <p className="text-red-400 text-xs mt-1">{errors.brand}</p>}
        </div>
        <div>
          <label htmlFor="model" className="block text-[10px] uppercase tracking-[0.2em] text-ink-400 mb-2">Modelo e Versão</label>
          <input
            type="text"
            id="model"
            name="model"
            value={model}
            onChange={(e) => setModel(e.target.value)}
            required
            className={inputClass}
            placeholder="Ex: 911 Carrera S"
          />
          {errors.model && <p className="text-red-400 text-xs mt-1">{errors.model}</p>}
        </div>
        <div>
          <label htmlFor="year" className="block text-[10px] uppercase tracking-[0.2em] text-ink-400 mb-2">Ano (Fab/Mod)</label>
          <input
            type="text"
            id="year"
            name="year"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            required
            className={inputClass}
            placeholder="Ex: 2022/2023"
          />
          {errors.year && <p className="text-red-400 text-xs mt-1">{errors.year}</p>}
        </div>
        <div>
          <label htmlFor="km" className="block text-[10px] uppercase tracking-[0.2em] text-ink-400 mb-2">Quilometragem</label>
          <input
            type="text"
            id="km"
            name="km"
            value={km}
            onChange={(e) => setKm(e.target.value)}
            required
            className={inputClass}
            placeholder="Ex: 15.000"
          />
          {errors.km && <p className="text-red-400 text-xs mt-1">{errors.km}</p>}
        </div>
      </div>

      <hr className="border-white/5" />

      {/* Personal Info */}
      <h2 className="font-display text-2xl text-white mb-8 pt-4">Seus Dados</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <label htmlFor="name" className="block text-[10px] uppercase tracking-[0.2em] text-ink-400 mb-2">Nome Completo</label>
          <input
            type="text"
            id="name"
            name="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className={inputClass}
            placeholder="Como deseja ser chamado?"
          />
          {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
        </div>
        <div>
          <label htmlFor="email" className="block text-[10px] uppercase tracking-[0.2em] text-ink-400 mb-2">E-mail</label>
          <input
            type="email"
            id="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass}
            placeholder="seu.email@exemplo.com"
          />
          {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
        </div>
        <div>
          <label htmlFor="phone" className="block text-[10px] uppercase tracking-[0.2em] text-ink-400 mb-2">WhatsApp</label>
          <input
            type="tel"
            id="phone"
            name="phone"
            maxLength={15}
            value={phone}
            onChange={(e) => setPhone(formatPhone(e.target.value))}
            required
            className={inputClass}
            placeholder="(00) 00000-0000"
          />
          {errors.phone && <p className="text-red-400 text-xs mt-1">{errors.phone}</p>}
        </div>
      </div>

      <hr className="border-white/5" />

      {/* Upload */}
      <div className="pt-4">
        <label className="block text-[10px] uppercase tracking-[0.2em] text-ink-400 mb-2">Fotos do Veículo (Opcional)</label>
        
        <input
          type="file"
          multiple
          accept="image/*"
          className="hidden"
          ref={fileInputRef}
          onChange={handleFileChange}
        />

        <div
          onClick={() => fileInputRef.current?.click()}
          className="border border-dashed border-white/20 rounded-xl bg-ink-950 p-8 text-center hover:border-primary-500/50 transition-colors cursor-pointer group mb-4"
        >
          <UploadCloud size={24} className="text-primary-500 mx-auto mb-4 group-hover:scale-110 transition-transform" />
          <p className="text-white text-sm font-light mb-1">Arraste e solte fotos ou clique para enviar</p>
          <p className="text-ink-500 text-xs">JPG ou PNG (Máx. 10MB)</p>
        </div>

        {/* File Preview */}
        {files.length > 0 && (
          <div className="space-y-2 mb-4">
            {files.map((file, index) => (
              <div key={index} className="flex items-center justify-between bg-ink-900 rounded-xl border border-white/5 px-4 py-3">
                <div className="flex items-center gap-3 overflow-hidden">
                  <ImageIcon size={16} className="text-primary-500 shrink-0" />
                  <span className="text-sm text-white font-light truncate">{file.name}</span>
                </div>
                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  className="text-ink-500 hover:text-red-400 transition-colors shrink-0"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
        )}

        <p className="text-ink-500 text-[10px] mt-2 italic">*Como o envio será feito via WhatsApp, as fotos anexadas aqui precisarão ser enviadas manualmente na conversa após clicar em Solicitar Avaliação.</p>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full flex justify-center items-center gap-2 bg-primary-500 hover:bg-primary-400 text-ink-950 px-8 py-5 text-[10px] uppercase tracking-[0.3em] font-bold rounded-xl transition-all duration-300 mt-8 disabled:opacity-70"
      >
        {isSubmitting ? (
          <><Loader2 size={16} className="animate-spin" /> Processando...</>
        ) : (
          "Solicitar Avaliação"
        )}
      </button>
    </form>
  );
}