"use client";

import Image from "next/image";
import Link from "next/link";

export default function NavbarOferta() {
  return (
    <nav className="fixed left-0 right-0 top-0 z-50 flex max-h-[56px] items-center justify-between border-b border-white/[0.06] bg-[#050505]/90 px-6 py-1 backdrop-blur-md">
      <Link href="https://cspnexora.com.br" target="_blank" rel="noopener noreferrer">
        <Image src="/logo.png" alt="CSP Nexora" width={207} height={113} className="h-auto w-[90px] object-contain" priority />
      </Link>
      <span className="text-[11px] text-white/40">(61) 98420-2578 · contato@cspnexora.com.br</span>
    </nav>
  );
}
