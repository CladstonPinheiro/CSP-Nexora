"use client";

import Image from "next/image";
import Link from "next/link";

export default function NavbarOferta() {
  return (
    <nav className="fixed left-0 right-0 top-0 z-50 flex h-[52px] max-h-[56px] items-center justify-between border-b border-white/[0.06] bg-[#050505]/90 px-6 py-0 backdrop-blur-md">
      <Link href="https://cspnexora.com.br" target="_blank" rel="noopener noreferrer">
        <Image src="/logo.png" alt="CSP Nexora" width={120} height={66} className="h-auto w-[80px] object-contain" priority />
      </Link>
      <div className="border border-cyan-500/30 bg-cyan-500/10 text-cyan-400 text-[10px] font-semibold tracking-widest px-3 py-1 rounded-full">
        WhatsApp (61) 9 8420-2578 &nbsp;|&nbsp; E-mail: contato@cspnexora.com.br
      </div>
    </nav>
  );
}
