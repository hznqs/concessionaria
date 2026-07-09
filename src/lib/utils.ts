import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number | string): string {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return 'R$ 0,00';
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
}

export function formatMileage(km: number): string {
  if (km >= 1000000) return `${(km / 1000000).toFixed(1)}M km`;
  if (km >= 1000) return `${(km / 1000).toFixed(1)}k km`;
  return `${km} km`;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.slice(0, length).trim() + '...';
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export function classNames(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

export const FUEL_LABELS: Record<string, string> = {
  FLEX: 'Flex',
  GASOLINE: 'Gasolina',
  DIESEL: 'Diesel',
  ELECTRIC: 'Elétrico',
  HYBRID: 'Híbrido',
  GNV: 'GNV',
};

export const TRANSMISSION_LABELS: Record<string, string> = {
  MANUAL: 'Manual',
  AUTOMATIC: 'Automático',
  CVT: 'CVT',
  SEMI_AUTOMATIC: 'Semi-Automático',
};

export const BODY_TYPE_LABELS: Record<string, string> = {
  SEDAN: 'Sedã',
  HATCH: 'Hatch',
  SUV: 'SUV',
  PICKUP: 'Picape',
  COUPE: 'Cupê',
  CONVERTIBLE: 'Conversível',
  MINIVAN: 'Minivan',
  WAGON: 'Perua',
  CROSSOVER: 'Crossover',
};

export const STATUS_CONFIG = {
  AVAILABLE: { label: 'Disponível', bg: 'bg-success-600', color: 'text-white', border: 'border-success-500' },
  RESERVED: { label: 'Reservado', bg: 'bg-warning-600', color: 'text-white', border: 'border-warning-500' },
  SOLD: { label: 'Vendido', bg: 'bg-ink-700', color: 'text-ink-300', border: 'border-ink-600' },
} as const;

export const LEAD_STATUS_CONFIG = {
  NEW:         { label: 'Novo',        bg: 'bg-blue-500/10',    color: 'text-blue-400',    border: 'border-blue-500/20' },
  CONTACTED:   { label: 'Contatado',   bg: 'bg-amber-500/10',   color: 'text-amber-400',   border: 'border-amber-500/20' },
  NEGOTIATING: { label: 'Negociando',  bg: 'bg-primary-500/10', color: 'text-primary-400', border: 'border-primary-500/20' },
  WON:         { label: 'Venda',       bg: 'bg-success-500/10', color: 'text-success-500', border: 'border-success-500/20' },
  LOST:        { label: 'Perdido',     bg: 'bg-ink-500/10',     color: 'text-ink-500',     border: 'border-ink-500/20' },
} as const;

export function calculatePMT(
  price: number,
  downPayment: number,
  months: number,
  monthlyRate: number
): number {
  const financed = price - downPayment;
  if (financed <= 0) return 0;
  const rate = monthlyRate;
  if (rate === 0) return financed / months;
  const factor = Math.pow(1 + rate, months);
  return (financed * rate * factor) / (factor - 1);
}

export function formatPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 11) {
    return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  }
  if (cleaned.length === 10) {
    return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  }
  return phone;
}

export function maskPhoneInput(value: string): string {
  let d = value.replace(/\D/g, '').slice(0, 11);
  if (d.length === 0) return '';
  if (d.length <= 2) return `(${d}`;
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

export function maskCnpjInput(value: string): string {
  let d = value.replace(/\D/g, '').slice(0, 14);
  if (d.length <= 2) return d;
  if (d.length <= 5) return `${d.slice(0, 2)}.${d.slice(2)}`;
  if (d.length <= 8) return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5)}`;
  if (d.length <= 12) return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8)}`;
  return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8, 12)}-${d.slice(12)}`;
}

export function maskCepInput(value: string): string {
  let d = value.replace(/\D/g, '').slice(0, 8);
  if (d.length <= 5) return d;
  return `${d.slice(0, 5)}-${d.slice(5)}`;
}

export function maskUfInput(value: string): string {
  return value.replace(/[^a-zA-Z]/g, '').toUpperCase().slice(0, 2);
}

export function generateWhatsAppLink(phone: string, message?: string): string {
  const cleaned = phone.replace(/\D/g, '');
  const text = message ? encodeURIComponent(message) : '';
  return `https://wa.me/55${cleaned}${text ? `?text=${text}` : ''}`;
}

export function getContrastColor(hexColor: string): string {
  const r = parseInt(hexColor.slice(1, 3), 16);
  const g = parseInt(hexColor.slice(3, 5), 16);
  const b = parseInt(hexColor.slice(5, 7), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? '#000000' : '#ffffff';
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function isValidPhone(phone: string): boolean {
  const cleaned = phone.replace(/\D/g, '');
  return cleaned.length >= 10 && cleaned.length <= 11;
}

export function formatDate(date: Date | string, options?: Intl.DateTimeFormatOptions): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    ...options,
  });
}

export function formatDateTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function relativeTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) return 'agora mesmo';
  if (diffMins < 60) return `${diffMins} min atrás`;
  if (diffHours < 24) return `${diffHours}h atrás`;
  if (diffDays < 7) return `${diffDays}d atrás`;
  return formatDate(d);
}

export function getYearRange(startYear: number = 1990): number[] {
  const currentYear = new Date().getFullYear();
  return Array.from({ length: currentYear - startYear + 2 }, (_, i) => currentYear + 1 - i);
}

export function parsePrice(price: string): number {
  return parseFloat(price.replace(/[^\d.,]/g, '').replace(',', '.')) || 0;
}

export function formatPriceInput(value: number): string {
  return value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}