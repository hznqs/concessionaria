'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Command } from 'cmdk';
import {
  LayoutDashboard, Car, Users, PlusCircle, BarChart3, Settings,
  LogOut, ArrowRight, Search, CornerDownLeft,
} from 'lucide-react';
import { signOut } from 'next-auth/react';
import { cn } from '@/lib/utils';

const COMMANDS = [
  { id: 'nav-dashboard', label: 'Dashboard', icon: LayoutDashboard, action: () => '/painel', group: 'Navegação' },
  { id: 'nav-stock', label: 'Estoque', icon: Car, action: () => '/painel/estoque', group: 'Navegação' },
  { id: 'nav-leads', label: 'Leads', icon: Users, action: () => '/painel/leads', group: 'Navegação' },
  { id: 'nav-reports', label: 'Relatórios', icon: BarChart3, action: () => '/painel/relatorios', group: 'Navegação' },
  { id: 'nav-settings', label: 'Configurações', icon: Settings, action: () => '/painel/configuracoes', group: 'Navegação' },
  { id: 'action-new-vehicle', label: 'Adicionar novo veículo', icon: PlusCircle, action: () => '/painel/estoque/novo', group: 'Ações' },
  { id: 'action-logout', label: 'Sair da conta', icon: LogOut, action: () => 'logout', group: 'Ações' },
];

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const router = useRouter();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const filtered = COMMANDS.filter(c =>
    c.label.toLowerCase().includes(query.toLowerCase())
  );

  const groups = filtered.reduce<Record<string, typeof COMMANDS>>((acc, cmd) => {
    (acc[cmd.group] ??= []).push(cmd);
    return acc;
  }, {});

  const runCommand = (cmd: typeof COMMANDS[0]) => {
    setOpen(false);
    setQuery('');
    if (cmd.action() === 'logout') {
      signOut({ callbackUrl: '/login' });
    } else {
      router.push(cmd.action());
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[12vh] px-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-xl"
        onClick={() => setOpen(false)}
      />
      <Command
        className="relative w-full max-w-lg apple-card rounded-2xl overflow-hidden"
        loop
      >
        <div className="flex items-center gap-3 px-4 border-b border-white/[0.05]">
          <Search className="h-4 w-4 text-ink-500 shrink-0" />
          <Command.Input
            autoFocus
            placeholder="Buscar ações, páginas..."
            value={query}
            onValueChange={setQuery}
            className="flex-1 bg-transparent text-white placeholder:text-ink-600 outline-none py-4 text-[15px] tracking-tight"
          />
          <kbd className="hidden sm:flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] text-ink-500 bg-white/[0.06] rounded-md border border-white/[0.08]">
            ESC
          </kbd>
        </div>
        <Command.List className="max-h-80 overflow-y-auto p-2 apple-no-scrollbar">
          <Command.Empty className="py-8 text-center text-ink-500 text-sm">
            Nenhum resultado encontrado.
          </Command.Empty>
          {Object.entries(groups).map(([group, items]) => (
            <Command.Group key={group} heading={group} className={cn('[&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:font-bold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-[0.14em] [&_[cmdk-group-heading]]:text-ink-600 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5')}>
              {items.map(cmd => (
                <Command.Item
                  key={cmd.id}
                  value={cmd.label}
                  onSelect={() => runCommand(cmd)}
                  className="flex items-center gap-3 px-2.5 py-2.5 rounded-xl text-[14px] text-ink-300 data-[selected]:bg-primary-500/10 data-[selected]:text-[#f1aeb1] cursor-pointer aria-selected:bg-primary-500/10 aria-selected:text-[#f1aeb1] transition-colors"
                >
                  <cmd.icon className="h-4 w-4 shrink-0" />
                  <span className="flex-1">{cmd.label}</span>
                  <ArrowRight className="h-3.5 w-3.5 text-ink-600 opacity-0 data-[selected]:opacity-100" />
                </Command.Item>
              ))}
            </Command.Group>
          ))}
        </Command.List>
        <div className="flex items-center justify-between px-4 py-2.5 border-t border-white/[0.05] text-[10px] text-ink-600">
          <span className="flex items-center gap-1">
            <CornerDownLeft className="h-3 w-3" /> selecionar
          </span>
          <span>↑↓ navegar</span>
        </div>
      </Command>
    </div>
  );
}