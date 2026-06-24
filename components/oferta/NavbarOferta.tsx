"use client";

import Image from "next/image";
import Link from "next/link";

export default function NavbarOferta() {
  return (
    <nav className="fixed left-0 right-0 top-0 z-50 flex items-center justify-between border-b border-white/[0.06] bg-[#050505]/90 px-6 py-4 backdrop-blur-md">
      <Link href="https://cspnexora.com.br" target="_blank" rel="noopener noreferrer">
        <Image src="/logo.png" alt="CSP Nexora" width={207} height={113} className="h-auto w-[90px] object-contain" priority />
      </Link>
      <a
        href="https://wa.me/5561984202578?text=Oi%2C+quero+saber+mais+sobre+o+site+profissional!"
        target="_blank"
        rel="noopener noreferrer"
        className="rounded-xl bg-[#25D366] px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-[#25D366]/25 transition hover:-translate-y-0.5 hover:bg-[#20ba5a]"
      >
        Falar no WhatsApp →
      </a>
    </nav>
  );
}
