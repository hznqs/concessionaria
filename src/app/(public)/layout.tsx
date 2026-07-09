import PublicLayoutClient from "@/components/public/public-layout-client";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return <PublicLayoutClient>{children}</PublicLayoutClient>;
}
