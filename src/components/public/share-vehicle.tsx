"use client";

import { useState } from "react";
import { Share2, Link2, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ShareVehicleProps {
  title: string;
  price: string;
}

export default function ShareVehicle({ title, price }: ShareVehicleProps) {
  const [copied, setCopied] = useState(false);
  const [open, setOpen] = useState(false);

  const currentUrl =
    typeof window !== "undefined" ? window.location.href : "";

  const whatsappText = encodeURIComponent(
    `Confira esse veículo na AutoPrime:\n*${title}*\n${price}\n\n${currentUrl}`
  );

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(currentUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-ink-500 hover:text-primary-500 dark:text-ink-400 dark:hover:text-white transition-colors pb-1 border-b border-ink-300 dark:border-ink-700 hover:border-primary-500 dark:hover:border-white"
      >
        <Share2 size={13} />
        Compartilhar
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.18 }}
            className="absolute bottom-full mb-3 left-0 glass-strong border border-ink-200 dark:border-white/10 p-3 flex flex-col gap-1 min-w-[200px] z-20"
          >
            {/* WhatsApp */}
            <a
              href={`https://wa.me/?text=${whatsappText}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-3 py-2.5 text-[11px] font-bold uppercase tracking-wider text-ink-600 hover:text-ink-900 dark:text-ink-300 dark:hover:text-white hover:bg-ink-100 dark:hover:bg-white/5 transition-colors rounded-lg"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="text-[#25D366]">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              WhatsApp
            </a>

            {/* Copy link */}
            <button
              onClick={copyLink}
              className="flex items-center gap-3 px-3 py-2.5 text-[11px] font-bold uppercase tracking-wider text-ink-600 hover:text-ink-900 dark:text-ink-300 dark:hover:text-white hover:bg-ink-100 dark:hover:bg-white/5 transition-colors w-full text-left rounded-lg"
            >
              <AnimatePresence mode="wait">
                {copied ? (
                  <motion.span key="check" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                    <Check size={14} className="text-primary-500 dark:text-primary-400" />
                  </motion.span>
                ) : (
                  <motion.span key="link" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                    <Link2 size={14} />
                  </motion.span>
                )}
              </AnimatePresence>
              {copied ? "Link copiado!" : "Copiar link"}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
