'use client';

import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard,
  Users,
  Building2,
  FolderKanban,
  CheckSquare,
  LogOut,
  ChevronRight,
} from 'lucide-react';
import { createSupabaseBrowserClient } from '@/lib/supabase';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/leads', label: 'Leads', icon: Users },
  { href: '/admin/clientes', label: 'Clientes', icon: Building2 },
  { href: '/admin/projetos', label: 'Projetos', icon: FolderKanban },
  { href: '/admin/tarefas', label: 'Tarefas', icon: CheckSquare },
];

export function AdminSidebar({ userEmail }: { userEmail: string }) {
  const pathname = usePathname();
  const router = useRouter();

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  const handleSignOut = async () => {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.push('/admin/login');
    router.refresh();
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-60 bg-[#080808] border-r border-white/5 flex flex-col z-40">
      {/* Logo */}
      <div className="px-5 py-6 border-b border-white/5">
        <img src="/logo.png" alt="CSP Nexora" className="h-8 w-auto object-contain" />
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const active = isActive(item.href, item.exact);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all group',
                active
                  ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                  : 'text-gray-600 hover:text-white hover:bg-white/5 border border-transparent'
              )}
            >
              <item.icon
                className={cn(
                  'w-4 h-4 shrink-0',
                  active ? 'text-cyan-400' : 'text-gray-700 group-hover:text-gray-300'
                )}
              />
              {item.label}
              {active && (
                <ChevronRight className="w-3 h-3 ml-auto text-cyan-400/50" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* User + Sign out */}
      <div className="px-3 py-4 border-t border-white/5 space-y-1">
        <div className="px-3 py-2">
          <p className="text-[9px] font-black uppercase tracking-widest text-gray-700">
            Logado como
          </p>
          <p className="text-xs text-gray-500 truncate mt-0.5">{userEmail}</p>
        </div>
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest text-gray-600 hover:text-red-400 hover:bg-red-500/5 border border-transparent transition-all"
        >
          <LogOut className="w-4 h-4" />
          Sair
        </button>
      </div>
    </aside>
  );
}
