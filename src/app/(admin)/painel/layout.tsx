import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import SessionProvider from "@/components/providers/SessionProvider";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import AdminSidebar from "@/components/admin/sidebar";
import { AdminTopbar } from "@/components/admin/topbar";
import { CommandPalette } from "@/components/admin/command-palette";
import { AdminPageTransition } from "@/components/admin/AdminPageTransition";

export default async function PainelLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  return (
    <SessionProvider session={session}>
      <NuqsAdapter>
        <div className="flex min-h-screen bg-ink-900 bg-[radial-gradient(ellipse_at_top_left,rgba(218,37,29,0.04)_0%,transparent_50%)]">
          <AdminSidebar />
          <div className="flex-1 flex flex-col min-w-0">
            <AdminTopbar />
            <main className="flex-1 overflow-auto p-3 sm:p-5 lg:p-6 pb-24 lg:pb-6">
              <AdminPageTransition>{children}</AdminPageTransition>
            </main>
          </div>
          <CommandPalette />
        </div>
      </NuqsAdapter>
    </SessionProvider>
  );
}