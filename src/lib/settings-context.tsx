"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

interface CompanyData {
  name?: string;
  cnpj?: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  about?: string;
  hoursWeekday?: string;
  hoursSaturday?: string;
  hoursSunday?: string;
  instagram?: string;
  facebook?: string;
  youtube?: string;
}

interface SettingsContextValue {
  whatsappNumber: string;
  company: CompanyData;
  loaded: boolean;
}

const defaultContext: SettingsContextValue = {
  whatsappNumber: "",
  company: {},
  loaded: false,
};

const SettingsContext = createContext<SettingsContextValue>(defaultContext);

const SETTINGS_CACHE_KEY = "autoprime:settings:v1";
const SETTINGS_CACHE_TTL = 5 * 60 * 1000; // 5 min

function loadFromCache(): SettingsContextValue | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(SETTINGS_CACHE_KEY);
    if (!raw) return null;
    const { data, ts } = JSON.parse(raw);
    if (Date.now() - ts > SETTINGS_CACHE_TTL) return null;
    return data;
  } catch {
    return null;
  }
}

function saveToCache(data: SettingsContextValue) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(SETTINGS_CACHE_KEY, JSON.stringify({ data, ts: Date.now() }));
  } catch {
    // ignore quota errors
  }
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [company, setCompany] = useState<CompanyData>({});
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const cached = loadFromCache();

    if (cached) {
      setWhatsappNumber(cached.whatsappNumber);
      setCompany(cached.company);
    }

    async function fetchSettings() {
      try {
        const [waRes, empRes] = await Promise.all([
          fetch("/api/settings/whatsapp", { cache: "no-store" }),
          fetch("/api/settings/empresa", { cache: "no-store" }),
        ]);

        if (!waRes.ok || !empRes.ok) throw new Error("Failed to fetch settings");

        const [wa, emp] = await Promise.all([
          waRes.json(),
          empRes.json(),
        ]);

        if (cancelled) return;

        const number = wa?.number ?? "";
        const companyData = emp ?? {};

        setWhatsappNumber(number);
        setCompany(companyData);
        setLoaded(true);
        saveToCache({ whatsappNumber: number, company: companyData, loaded: true });
      } catch (err) {
        if (!cancelled) {
          console.warn("[Settings] fetch failed, using cache/fallback", err);
          setLoaded(true);
        }
      }
    }

    fetchSettings();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <SettingsContext.Provider value={{ whatsappNumber, company, loaded }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be used within SettingsProvider");
  return ctx;
}
