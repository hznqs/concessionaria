import type { Metadata, Viewport } from "next";
import { Montserrat, Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/providers/theme-provider";
import { SmoothScroll } from "@/components/providers/smooth-scroll";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-display",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "AutoPrime | Ofertas de Carros Seminovos e Usados",
    template: "%s | AutoPrime",
  },
  description:
    "As melhores ofertas de veículos seminovos e usados com garantia, financiamento facilitado e avaliação justa no seu usado. Compre seu carro na AutoPrime.",
  keywords: ["carros", "carros usados", "seminovos", "compra de carros", "financiamento", "ofertas"],
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: "AutoPrime Seminovos",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f8fafc" },
    { media: "(prefers-color-scheme: dark)", color: "#080d16" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${montserrat.variable} ${inter.variable}`} suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="font-body antialiased bg-ink-50 dark:bg-ink-950 text-ink-900 dark:text-ink-100">
        <ThemeProvider defaultTheme="system" storageKey="autoprime-theme">
          <SmoothScroll>
            {children}
          </SmoothScroll>
        </ThemeProvider>
      </body>
    </html>
  );
}
