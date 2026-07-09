"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Phone, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import FavoritesNavButton from "@/components/public/favorites-nav-button";
import { useSettings } from "@/lib/settings-context";
import { cn } from "@/lib/utils";

const navLinks = [
  { name: "Veículos",         href: "/veiculos" },
  { name: "Unidades",        href: "/unidades" },
  { name: "Sobre Nós",       href: "/sobre"    },
  { name: "Venda seu Carro", href: "/venda"    },
  { name: "Contato",         href: "/contato"  },
];

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])';

export default function PublicHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const menuRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const firstLinkRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileMenuOpen]);

  useEffect(() => {
    if (mobileMenuOpen) {
      firstLinkRef.current?.focus();
    } else {
      toggleRef.current?.focus();
    }
  }, [mobileMenuOpen]);

  const handleMenuKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") {
      setMobileMenuOpen(false);
      return;
    }
    if (e.key === "Tab" && menuRef.current) {
      const focusable = Array.from(
        menuRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }, []);

  useEffect(() => {
    if (mobileMenuOpen) {
      document.addEventListener("keydown", handleMenuKeyDown);
      return () => document.removeEventListener("keydown", handleMenuKeyDown);
    }
  }, [mobileMenuOpen, handleMenuKeyDown]);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const { whatsappNumber } = useSettings();

  return (
    <>
      <header
        className={cn(
          "fixed top-0 w-full z-50 transition-all duration-500",
          scrolled ? "border-b border-white/[0.06] bg-ink-950/92 backdrop-blur-xl" : "border-b border-transparent",
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-8 h-16 grid grid-cols-[auto_1fr_auto] items-center relative z-10">
          <Link href="/" className="flex items-center group relative z-[60]">
            <span className="font-display uppercase tracking-[0.28em] text-[13px] font-light text-ink-100 transition-colors">
              Auto
              <span className="font-black text-primary-500 transition-colors group-hover:text-primary-400">
                Prime
              </span>
            </span>
          </Link>

          <nav className="hidden lg:flex items-center justify-center gap-8 text-[11px] font-bold tracking-[0.18em] uppercase">
            {navLinks.map((link) => {
              const isActive = pathname === link.href || pathname.startsWith(link.href + "/");
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "relative transition-colors duration-200 pb-1 hover:text-ink-100",
                    isActive ? "text-primary-500" : "text-ink-400",
                  )}
                >
                  {link.name}
                  {isActive && (
                    <span className="absolute -bottom-px left-0 right-0 h-px bg-primary-500" />
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center justify-end gap-3 sm:gap-5 relative z-[60]">
            <FavoritesNavButton />

            <a
              href={`https://wa.me/${whatsappNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-ink-400 transition-colors duration-200 hover:text-primary-500"
            >
              <Phone size={13} className="opacity-70" />
              Contato
            </a>

            <Link
              href="/veiculos"
              className="hidden sm:inline-flex btn-prime px-5 py-2.5 text-[11px]"
            >
              Ver Veículos
            </Link>

            <button
              ref={toggleRef}
              className="lg:hidden p-2 -mr-2 text-ink-100 transition-colors duration-200"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? "Fechar menu" : "Abrir menu"}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-menu"
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            id="mobile-menu"
            ref={menuRef}
            role="dialog"
            aria-modal="true"
            aria-label="Menu de navegação"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-40 lg:hidden bg-ink-950"
          >
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary-500 to-transparent" />

            <motion.nav
              initial={{ opacity: 0, y: -16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.35 }}
              className="flex flex-col gap-2 pt-24 px-6"
            >
              {navLinks.map((link, i) => (
                <motion.div
                  key={link.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + i * 0.07, duration: 0.35 }}
                >
                  <Link
                    ref={i === 0 ? firstLinkRef : undefined}
                    href={link.href}
                    aria-current={pathname === link.href ? "page" : undefined}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center justify-between py-4 border-b border-white/5 transition-colors duration-200 group",
                      pathname === link.href ? "text-primary-500" : "text-ink-400 hover:text-ink-100",
                    )}
                  >
                    <span className="font-display text-2xl font-bold tracking-tight">
                      {link.name}
                    </span>
                    {pathname === link.href && (
                      <span className="w-2 h-2 rounded-full bg-primary-500" />
                    )}
                  </Link>
                </motion.div>
              ))}
            </motion.nav>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="absolute bottom-0 left-0 right-0 p-6 flex flex-col gap-4"
            >
              <Link
                href="/veiculos"
                onClick={() => setMobileMenuOpen(false)}
                className="btn-prime w-full py-4 text-sm"
              >
                Ver Veículos
              </Link>
              <a
                href={`https://wa.me/${whatsappNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 text-[11px] font-bold uppercase tracking-widest text-ink-500 transition-colors hover:text-primary-500"
              >
                <Phone size={13} />
                Entrar em Contato
              </a>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
