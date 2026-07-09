"use client";

import { NuqsAdapter } from "nuqs/adapters/next/app";
import { ToastProvider, ToastViewport } from "@/components/ui/base/toast";
import { SettingsProvider } from "@/lib/settings-context";
import PublicHeader from "@/components/public/header";
import PublicFooter from "@/components/public/footer";
import WhatsAppFAB from "@/components/public/whatsapp-fab";
import { ScrollProgress } from "@/components/public/ui/ScrollProgress";
import { SkipLink } from "@/components/public/ui/SkipLink";
import { PageTransition } from "@/components/public/ui/PageTransition";

export default function PublicLayoutClient({ children }: { children: React.ReactNode }) {
  return (
    <NuqsAdapter>
      <SettingsProvider>
        <ToastProvider>
          <SkipLink />
          <ScrollProgress />
          <PublicHeader />
          <main id="main-content" tabIndex={-1}>
            <PageTransition>{children}</PageTransition>
          </main>
          <PublicFooter />
          <WhatsAppFAB />
          <ToastViewport />
        </ToastProvider>
      </SettingsProvider>
    </NuqsAdapter>
  );
}
