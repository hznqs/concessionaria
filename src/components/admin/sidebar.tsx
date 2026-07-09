'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { cn } from '@/lib/utils';
import { useSidebarStore } from '@/stores/sidebar-store';
import {
  LayoutDashboard, Car, Users, LogOut, ExternalLink, PlusCircle,
  ChevronLeft, ChevronRight, X, BarChart3, Settings,
} from 'lucide-react';

const NAV = [
  { href: '/painel', label: 'Início', icon: LayoutDashboard },
  { href: '/painel/estoque', label: 'Estoque', icon: Car },
  { href: '/painel/leads', label: 'Leads', icon: Users },
  { href: '/painel/relatorios', label: 'Relatórios', icon: BarChart3 },
];

const SECONDARY_NAV = [
  { href: '/painel/configuracoes', label: 'Ajustes', icon: Settings },
];

const MOBILE_TABS = [
  { href: '/painel', label: 'Início', icon: LayoutDashboard },
  { href: '/painel/estoque', label: 'Estoque', icon: Car },
  { href: '/painel/estoque/novo', label: 'Adicionar', icon: PlusCircle, highlight: true },
  { href: '/painel/leads', label: 'Leads', icon: Users },
  { href: '/painel/configuracoes', label: 'Ajustes', icon: Settings },
];

export default function AdminSidebar() {
  const path = usePathname();
  const { data: session } = useSession();
  const { collapsed, mobileOpen, toggle, setMobileOpen } = useSidebarStore();

  const isActive = (href: string) =>
    href === '/painel' ? path === href : path.startsWith(href);

  const SidebarContent = (
    <>
      <div className={cn('flex items-center h-16 px-4 border-b border-white/[0.04]', collapsed && 'justify-center')}>
        <Link href="/painel" className="flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded-[10px] bg-gradient-to-br from-primary-400 via-primary-500 to-primary-700 flex items-center justify-center font-black text-sm text-white shadow-lg shadow-primary-500/30 shrink-0">
            AP
          </div>
          {!collapsed && (
            <div>
              <p className="font-semibold text-white text-sm leading-tight tracking-tight">AutoPrime</p>
              <p className="text-[10px] text-ink-500 font-medium tracking-wide">Painel Admin</p>
            </div>
          )}
        </Link>
        {!collapsed && (
          <button
            onClick={toggle}
            className="ml-auto p-2.5 rounded-lg text-ink-500 hover:text-white hover:bg-white/5 transition-colors hidden lg:block"
            aria-label="Recolher"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        )}
      </div>

      <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto apple-no-scrollbar">
        <p className={cn('px-3 pt-2 pb-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-ink-600', collapsed && 'sr-only')}>Gerenciar</p>
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = isActive(href);
          return (
            <Link
              key={href}
              href={href}
              title={collapsed ? label : undefined}
              className={cn(
                'relative flex items-center rounded-xl text-[13px] font-medium transition-all',
                collapsed ? 'justify-center p-2.5' : 'gap-2.5 px-3 py-2.5',
                active ? 'apple-nav-active' : 'text-ink-400 hover:text-white hover:bg-white/[0.04]'
              )}
            >
              <Icon className="h-[18px] w-[18px] shrink-0" strokeWidth={active ? 2.3 : 2} />
              {!collapsed && <span>{label}</span>}
            </Link>
          );
        })}

        <div className="pt-3 mt-2">
          <Link
            href="/painel/estoque/novo"
            title={collapsed ? 'Novo Veículo' : undefined}
            className={cn(
              'flex items-center rounded-xl text-[13px] font-semibold text-white bg-gradient-to-br from-primary-400 via-primary-500 to-primary-700 shadow-lg shadow-primary-500/30 hover:shadow-xl hover:shadow-primary-500/40 hover:-translate-y-px transition-all',
              collapsed ? 'justify-center p-2.5' : 'gap-2.5 px-3 py-2.5'
            )}
          >
            <PlusCircle className="h-[18px] w-[18px] shrink-0" strokeWidth={2.3} />
            {!collapsed && <span>Novo Veículo</span>}
          </Link>
        </div>

        <p className={cn('px-3 pt-5 pb-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-ink-600', collapsed && 'sr-only')}>Sistema</p>
        <div className="space-y-0.5">
          {SECONDARY_NAV.map(({ href, label, icon: Icon }) => {
            const active = isActive(href);
            return (
              <Link
                key={href}
                href={href}
                title={collapsed ? label : undefined}
                className={cn(
                  'relative flex items-center rounded-xl text-[13px] font-medium transition-all',
                  collapsed ? 'justify-center p-2.5' : 'gap-2.5 px-3 py-2.5',
                  active ? 'apple-nav-active' : 'text-ink-500 hover:text-white hover:bg-white/[0.04]'
                )}
              >
                <Icon className="h-[18px] w-[18px] shrink-0" strokeWidth={active ? 2.3 : 2} />
                {!collapsed && <span>{label}</span>}
              </Link>
            );
          })}
        </div>
      </nav>

      <div className="border-t border-white/[0.04] p-3 space-y-0.5">
        {!collapsed && session?.user && (
          <div className="flex items-center gap-2.5 px-2 py-2 mb-1">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-semibold text-xs shrink-0">
              {session.user.name?.charAt(0) ?? 'A'}
            </div>
            <div className="min-w-0">
              <p className="text-white text-xs font-medium truncate">{session.user.name}</p>
              <p className="text-ink-500 text-[10px] truncate">{session.user.email}</p>
            </div>
          </div>
        )}
        <Link
          href="/"
          target="_blank"
          title={collapsed ? 'Ver Site' : undefined}
          className={cn(
            'flex items-center rounded-xl text-xs text-ink-500 hover:text-white hover:bg-white/[0.04] transition-all',
            collapsed ? 'justify-center p-2.5' : 'gap-2.5 px-3 py-2.5'
          )}
        >
          <ExternalLink className="h-4 w-4 shrink-0" />
          {!collapsed && <span>Ver Site</span>}
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          title={collapsed ? 'Sair' : undefined}
          className={cn(
            'flex items-center rounded-xl text-xs text-ink-500 hover:text-red-400 hover:bg-red-500/5 transition-all w-full',
            collapsed ? 'justify-center p-2.5' : 'gap-2.5 px-3 py-2.5'
          )}
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {!collapsed && <span>Sair</span>}
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop sidebar — frosted */}
      <aside
        className={cn(
          'hidden lg:flex flex-col h-screen sticky top-0 shrink-0 apple-sidebar transition-[width] duration-300 ease-out',
          collapsed ? 'w-[76px]' : 'w-[260px]'
        )}
      >
        {SidebarContent}
        {collapsed && (
          <button
            onClick={toggle}
            className="absolute -right-3 top-20 z-10 bg-primary-600 text-white rounded-full p-1 shadow-lg hover:bg-primary-700 transition-colors"
            aria-label="Expandir"
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        )}
      </aside>

      {/* Mobile sheet overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="relative w-[280px] h-full apple-sidebar flex flex-col animate-apple-sheet">
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full text-ink-400 hover:text-white hover:bg-white/10"
              aria-label="Fechar"
            >
              <X className="h-5 w-5" />
            </button>
            {SidebarContent}
          </aside>
        </div>
      )}

      {/* Mobile bottom tab bar (iOS-style) */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 apple-tabbar">
        <div className="flex items-stretch justify-around px-1 pt-1">
          {MOBILE_TABS.map(({ href, label, icon: Icon, highlight }) => {
            const active = highlight ? false : isActive(href);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex flex-col items-center justify-center gap-0.5 py-1.5 px-2 min-w-[60px] rounded-t-2xl transition-colors',
                  highlight
                    ? '-mt-4 bg-gradient-to-br from-primary-400 via-primary-500 to-primary-700 text-white shadow-lg shadow-primary-500/40 rounded-full p-3 w-12 h-12 self-start'
                    : active ? 'text-primary-400' : 'text-ink-500'
                )}
              >
                <Icon className={cn('shrink-0', highlight ? 'h-6 w-6' : 'h-[22px] w-[22px]')} strokeWidth={active || highlight ? 2.3 : 2} />
                {!highlight && <span className="text-[10px] font-medium tracking-tight">{label}</span>}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}