import { prisma } from "@/lib/prisma";
import { unstable_cache } from "next/cache";

export async function getSetting(key: string): Promise<string | null> {
  const setting = await prisma.setting.findUnique({ where: { key } });
  return setting?.value ?? null;
}

export function normalizeWhatsappNumber(input: string): string {
  const d = (input ?? "").replace(/\D/g, "");
  if (d.length === 0) return "";
  if (d.startsWith("55") && (d.length === 12 || d.length === 13)) return d;
  if (d.length === 11 || d.length === 10) return `55${d}`;
  if (!d.startsWith("55")) return `55${d}`;
  return d;
}

const fetchWhatsappNumber = async (): Promise<string> => {
  const company = await prisma.setting.findUnique({ where: { key: "company_phone" } });
  if (company?.value) {
    const normalized = normalizeWhatsappNumber(company.value);
    if (normalized) return normalized;
  }
  const legacy = await prisma.setting.findUnique({ where: { key: "whatsapp" } });
  if (legacy?.value) {
    const normalized = normalizeWhatsappNumber(legacy.value);
    if (normalized) return normalized;
  }
  return normalizeWhatsappNumber(process.env.NEXT_PUBLIC_WHATSAPP ?? "") || "5511999990000";
};

export const getWhatsappNumber = unstable_cache(
  fetchWhatsappNumber,
  ["whatsapp-number-server"],
  { revalidate: 60, tags: ["settings"] },
);

export type CompanySettings = {
  name: string; cnpj: string; phone: string; email: string;
  address: string; city: string; state: string; cep: string;
  hoursWeekday: string; hoursSaturday: string; hoursSunday: string;
  instagram: string; facebook: string; youtube: string; logo: string; about: string;
};

export const COMPANY_KEYS = [
  "name", "cnpj", "phone", "email", "address", "city", "state", "cep",
  "hoursWeekday", "hoursSaturday", "hoursSunday",
  "instagram", "facebook", "youtube", "logo", "about",
] as const;

const COMPANY_DEFAULTS: CompanySettings = {
  name: "AutoPrime", cnpj: "", phone: "", email: "contato@autoprime.com.br",
  address: "Av. Europa, 1000", city: "São Paulo", state: "SP", cep: "",
  hoursWeekday: "08h às 18h", hoursSaturday: "09h às 14h", hoursSunday: "Fechado",
  instagram: "", facebook: "", youtube: "", logo: "",
  about: "Veículos premium com transparência, qualidade e atendimento exclusivo. A verdadeira definição de excelência automotiva.",
};

async function fetchCompanySettings(): Promise<CompanySettings> {
  const rows = await prisma.setting.findMany({
    where: { key: { startsWith: "company_" } },
  });
  const map: Record<string, string> = {};
  for (const r of rows) map[r.key] = r.value;

  const result = { ...COMPANY_DEFAULTS };
  for (const field of COMPANY_KEYS) {
    const v = map[`company_${field}`];
    if (v !== undefined) (result as Record<string, string>)[field] = v;
  }
  return result;
}

export const getCompanySettings = unstable_cache(
  fetchCompanySettings,
  ["company-settings-server"],
  { revalidate: 60, tags: ["settings"] },
);
