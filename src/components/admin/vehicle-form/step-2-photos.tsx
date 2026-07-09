"use client";

import { useFormContext, useFieldArray } from "react-hook-form";
import type { VehicleFormData } from "./multi-step-form";
import { ImagePlus, Trash2, Star, Loader2, X } from "lucide-react";
import { useState, useRef, useCallback, DragEvent } from "react";
import { cn } from "@/lib/utils";
import { apiFetch } from "@/lib/api-client";

type UploadState = "idle" | "uploading" | "done" | "error";

interface LocalImage {
  file: File;
  preview: string;
  state: UploadState;
  error?: string;
}

export default function Step2Photos() {
  const { control, setValue, watch, clearErrors, formState: { errors } } =
    useFormContext<VehicleFormData>();

  const { fields, append, remove } = useFieldArray({ control, name: "images" });
  const images = watch("images");

  const [dragging, setDragging] = useState(false);
  const [localQueue, setLocalQueue] = useState<LocalImage[]>([]);
  const [skippedFiles, setSkippedFiles] = useState<string[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  // ── Helpers ────────────────────────────────────────────────────────────────
  function setCover(idx: number) {
    const updated = images.map((img, i) => ({ ...img, isCover: i === idx }));
    setValue("images", updated);
  }

  // ── File upload ─────────────────────────────────────────────────────────────
  const uploadFile = useCallback(async (file: File) => {
    const preview = URL.createObjectURL(file);
    const idx = localQueue.length;

    setLocalQueue((q) => [...q, { file, preview, state: "uploading" }]);

    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await apiFetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error ?? "Erro no upload");

      // Adiciona ao form
      const isFirst = fields.length === 0;
      append({ url: data.url, isCover: isFirst });
      clearErrors("images");

      setLocalQueue((q) =>
        q.map((item, i) =>
          i === idx ? { ...item, state: "done" } : item
        )
      );
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erro no upload";
      setLocalQueue((q) =>
        q.map((item, i) =>
          i === idx ? { ...item, state: "error", error: message } : item
        )
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [append, fields.length]);

  function handleFiles(files: FileList | null) {
    if (!files) return;
    const allowed = ["image/jpeg", "image/png", "image/webp", "image/avif"];
    const skipped: string[] = [];
    Array.from(files).forEach((f) => {
      if (!allowed.includes(f.type)) { skipped.push(f.name); return; }
      if (f.size > 10 * 1024 * 1024) { skipped.push(f.name); return; }
      uploadFile(f);
    });
    if (skipped.length > 0) {
      setSkippedFiles(skipped);
      setTimeout(() => setSkippedFiles([]), 5000);
    }
  }

  // ── Drag & Drop ─────────────────────────────────────────────────────────────
  function onDragOver(e: DragEvent) { e.preventDefault(); setDragging(true); }
  function onDragLeave() { setDragging(false); }
  function onDrop(e: DragEvent) {
    e.preventDefault();
    setDragging(false);
    handleFiles(e.dataTransfer.files);
  }

  const uploading = localQueue.some((q) => q.state === "uploading");

  return (
    <div>
      <h2 className="font-display text-lg font-semibold text-white mb-1">
        Fotos do Veículo
      </h2>
      <p className="text-ink-400 text-sm mb-6">
        Faça upload de fotos do seu dispositivo. A primeira foto será a capa.
      </p>

      {/* Drop zone */}
      <div
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={() => fileRef.current?.click()}
        className={cn(
          "relative border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center gap-3",
          "cursor-pointer transition-all duration-200 mb-6",
          dragging
            ? "border-primary-500 bg-primary-500/10 scale-[1.01]"
            : "border-white/15 bg-ink-900/50 hover:border-primary-500/50 hover:bg-primary-500/5"
        )}
      >
        {uploading ? (
          <>
            <Loader2 size={32} className="text-primary-400 animate-spin" />
            <p className="text-sm text-ink-400 font-medium">Enviando...</p>
          </>
        ) : (
          <>
            <div className="w-14 h-14 rounded-2xl bg-primary-500/10 border border-primary-500/30 flex items-center justify-center">
              <ImagePlus size={24} className="text-primary-400" />
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-white mb-1">
                Arraste fotos aqui ou clique para selecionar
              </p>
              <p className="text-xs text-ink-500">
                JPG, PNG, WebP ou AVIF • Máx. 10MB por foto • Múltiplas seleções
              </p>
            </div>
          </>
        )}

        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {/* Error */}
      {errors.images && (
        <p className="text-red-400 text-xs mb-4">
          {(errors.images as { message?: string })?.message ?? "Adicione pelo menos 1 foto"}
        </p>
      )}

      {/* ── Photo grid ── */}
      {fields.length > 0 && (
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-ink-500 mb-3">
            {fields.length} foto{fields.length !== 1 ? "s" : ""} adicionada{fields.length !== 1 ? "s" : ""}
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {fields.map((field, idx) => {
              const img = images[idx];
              return (
                <div
                  key={field.id}
                  className={cn(
                    "relative group rounded-xl overflow-hidden bg-ink-800 aspect-[4/3]",
                    img.isCover && "ring-2 ring-primary-500"
                  )}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img.url}
                    alt={`Foto ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />

                  {/* Cover badge */}
                  {img.isCover && (
                    <div className="absolute top-2 left-2 bg-primary-500 text-ink-950 text-[9px] font-black px-2 py-1 uppercase tracking-wider">
                      CAPA
                    </div>
                  )}

                  {/* Index */}
                  {!img.isCover && (
                    <div className="absolute top-2 left-2 bg-black/60 text-ink-300 text-[10px] font-bold px-2 py-0.5 rounded">
                      {idx + 1}
                    </div>
                  )}

                  {/* Hover actions */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    {!img.isCover && (
                      <button
                        type="button"
                        onClick={() => setCover(idx)}
                        title="Definir como capa"
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary-500 text-ink-950 text-[10px] font-black uppercase tracking-wide hover:bg-primary-400 transition-colors"
                      >
                        <Star size={11} />
                        Capa
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => remove(idx)}
                      title="Remover"
                      className="p-2 rounded-lg bg-red-500/80 text-white hover:bg-red-500 transition-colors"
                    >
                      <X size={13} />
                    </button>
                  </div>
                </div>
              );
            })}

            {/* Add more */}
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="aspect-[4/3] rounded-xl border-2 border-dashed border-white/10
                         hover:border-primary-500/50 hover:bg-primary-500/5
                         flex flex-col items-center justify-center gap-2
                         text-ink-600 hover:text-primary-400 transition-all"
            >
              <ImagePlus size={20} />
              <span className="text-[11px] font-medium">Mais fotos</span>
            </button>
          </div>
        </div>
      )}

      {/* Skipped files feedback */}
      {skippedFiles.length > 0 && (
        <div className="mt-4 flex items-center gap-2 text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2">
          {skippedFiles.length} arquivo{skippedFiles.length !== 1 ? "s" : ""} ignorado{skippedFiles.length !== 1 ? "s" : ""} (tipo não permitido ou muito grande)
        </div>
      )}

      {/* Upload queue errors */}
      {localQueue.some((q) => q.state === "error") && (
        <div className="mt-4 space-y-1.5">
          {localQueue
            .filter((q) => q.state === "error")
            .map((q, i) => (
              <div key={i} className="flex items-center gap-2 text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                <Trash2 size={12} />
                {q.file.name}: {q.error}
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
