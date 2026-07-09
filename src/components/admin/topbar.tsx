'use client';

import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Menu, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSidebarStore } from '@/stores/sidebar-store';
import { NotificationsBell } from '@/components/admin/notifications-bell';

const PAGE_TITLES: Record<string, string> = {
  '/painel': 'Início',
  '/painel/estoque': 'Estoque',
  '/painel/estoque/novo': 'Novo Veículo',
  '/painel/leads': 'Leads',
  '/painel/relatorios': 'Relatórios',
  '/painel/configuracoes': 'Ajustes',
};

export function AdminTopbar() {
  const path = usePathname();
  const { data: session } = useSession();
  const { setMobileOpen } = useSidebarStore();

  const title = PAGE_TITLES[path] ?? (path.startsWith('/painel/estoque/') ? 'Editar Veículo' : 'Painel');

  return (
    <header className="sticky top-0 z-30 h-14 sm:h-16 apple-topbar flex items-center px-3 sm:px-4 lg:px-6 gap-3">
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden p-2 -ml-1 rounded-full text-ink-400 hover:text-white hover:bg-white/[0.06] transition-colors"
        aria-label="Abrir menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className="min-w-0 flex-1">
        <h1 className="text-base sm:text-lg font-bold text-white truncate tracking-tight">{title}</h1>
      </div>

      <div className="flex items-center gap-1.5 sm:gap-2">
        <button
          className="hidden sm:flex items-center justify-center w-9 h-9 rounded-full text-ink-400 hover:text-white hover:bg-white/[0.06] transition-colors"
          aria-label="Buscar (Cmd+K)"
        >
          <Search className="h-[18px] w-[18px]" />
        </button>
        <NotificationsBell />

        <div className="flex items-center gap-2 pl-2 sm:pl-3 ml-1 border-l border-white/[0.06]">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-semibold text-xs shrink-0 ring-1 ring-white/10">
            {session?.user?.name?.charAt(0) ?? 'A'}
          </div>
          <div className="hidden lg:block min-w-0">
            <p className="text-white text-[13px] font-medium truncate max-w-[140px] leading-tight">{session?.user?.name}</p>
            <p className="text-ink-500 text-[10px] leading-tight">Administrador</p>
          </div>
        </div>
      </div>
    </header>
  );
}