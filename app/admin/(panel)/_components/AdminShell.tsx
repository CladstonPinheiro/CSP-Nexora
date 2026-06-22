'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { Menu } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { AdminSidebar } from './AdminSidebar';

export function AdminShell({ userEmail }: { userEmail: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const logoHref = pathname === '/admin' ? '/' : '/admin';

  return (
    <>
      {/* Barra de topo — só no mobile */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-14 z-[60] bg-[#080808] border-b border-white/5 flex items-center justify-between px-4">
        <Link href={logoHref} aria-label={logoHref === '/' ? 'Voltar ao site' : 'Dashboard'}>
          <Image
            src="/logo.png"
            alt="CSP Nexora"
            width={207}
            height={113}
            className="w-[80px] h-auto object-contain"
          />
        </Link>
        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="text-[10px] font-black uppercase tracking-widest text-gray-600 hover:text-gray-400 transition-colors px-2 py-1"
          >
            ← Site
          </Link>
          <button
            onClick={() => setIsOpen(true)}
            aria-label="Abrir menu"
            className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-all"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Overlay — mobile, aparece ao abrir o menu */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}

      <AdminSidebar
        userEmail={userEmail}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </>
  );
}
