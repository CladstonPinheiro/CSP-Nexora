'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useTheme } from 'next-themes';
import {
  LayoutDashboard,
  Users,
  Building2,
  FolderKanban,
  CheckSquare,
  LogOut,
  ChevronRight,
  Globe,
  CalendarClock,
  Sun,
  Moon,
  MapPin,
} from 'lucide-react';
import { createSupabaseBrowserClient } from '@/lib/supabase';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/admin',         label: 'Dashboard',       icon: LayoutDashboard, exact: true },
  { href: '/admin/leads',   label: 'Leads',            icon: Users },
  { href: '/admin/agenda',  label: 'Agenda',           icon: CalendarClock },
  { href: '/admin/clientes',label: 'Clientes',         icon: Building2 },
  { href: '/admin/projetos',label: 'Projetos',         icon: FolderKanban },
  { href: '/admin/tarefas', label: 'Tarefas',          icon: CheckSquare },
  { href: '/admin/gmn',     label: 'Prospecção GMN',   icon: Globe },
  { href: '/admin/prospeccao', label: 'Prospecção Maps', icon: MapPin },
];

interface AdminSidebarProps {
  userEmail: string;
  isOpen: boolean;
  onClose: () => void;
}

export function AdminSidebar({ userEmail, isOpen, onClose }: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  const handleSignOut = async () => {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.push('/admin/login');
    router.refresh();
  };

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 h-screen w-60 bg-surface border-r border-border flex flex-col z-50',
        'transition-transform duration-300 ease-in-out',
        // Mobile: desliza para dentro/fora conforme isOpen
        isOpen ? 'translate-x-0' : '-translate-x-full',
        // Desktop: sempre visível, ignora isOpen
        'md:translate-x-0',
      )}
    >
      {/* Logo */}
      <div className="px-4 py-5 border-b border-border flex justify-center">
        <Link href="/" aria-label="Voltar ao site">
          <Image
            src="/logo.png"
            alt="CSP Nexora"
            width={207}
            height={113}
            className="w-[100px] h-auto object-contain"
          />
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const active = isActive(item.href, item.exact);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all group',
                active
                  ? 'bg-white/10 text-primary border border-border-strong'
                  : 'text-muted hover:text-primary hover:bg-white/5 border border-transparent'
              )}
            >
              <item.icon
                className={cn(
                  'w-4 h-4 shrink-0',
                  active ? 'text-primary' : 'text-muted group-hover:text-secondary'
                )}
              />
              {item.label}
              {active && <ChevronRight className="w-3 h-3 ml-auto text-primary/50" />}
            </Link>
          );
        })}
      </nav>

      {/* User + tema + Sign out */}
      <div className="px-3 py-4 border-t border-border space-y-1">
        <div className="flex items-center justify-between gap-2 px-3 py-2">
          <div className="min-w-0">
            <p className="text-[9px] font-black uppercase tracking-widest text-muted">
              Logado como
            </p>
            <p className="text-xs text-muted truncate mt-0.5">{userEmail}</p>
          </div>
          {mounted && (
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              aria-label={theme === 'dark' ? 'Ativar tema claro' : 'Ativar tema escuro'}
              title={theme === 'dark' ? 'Ativar tema claro' : 'Ativar tema escuro'}
              className="shrink-0 w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 border border-border hover:border-border-strong flex items-center justify-center text-muted hover:text-primary transition-all"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          )}
        </div>
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest text-muted hover:text-red-400 hover:bg-red-500/5 border border-transparent transition-all"
        >
          <LogOut className="w-4 h-4" />
          Sair
        </button>
      </div>
    </aside>
  );
}
