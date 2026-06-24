"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { X } from "lucide-react";

function WhatsAppModal({ onClose }: { onClose: () => void }) {
  const [nome, setNome] = useState("");
  const [empresa, setEmpresa] = useState("");
  const [telefone, setTelefone] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const msg = encodeURIComponent(
      `Olá! Sou ${nome} da ${empresa}. Vi a oferta de site profissional e quero saber mais!`
    );

    fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nome,
        empresa,
        telefone,
        email: "",
        source: "prospeccao_gmn",
        stage: "identificado",
        notes: "Lead GMN — WhatsApp direto",
      }),
    }).catch(() => {});

    window.open(`https://wa.me/5561984202578?text=${msg}`, "_blank");
    onClose();
  }

  const inputClass =
    "w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-3 text-sm text-white placeholder-white/20 outline-none transition focus:border-[#25D366]/50";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md rounded-2xl border border-[#25D366]/30 bg-[#050505]/95 p-8 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 text-white/40 transition hover:bg-white/10 hover:text-white"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="mb-6 flex flex-col items-center text-center">
          <svg viewBox="0 0 24 24" className="mb-4 h-12 w-12 fill-[#25D366]" xmlns="http://www.w3.org/2000/svg">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
          <h2 className="font-outfit text-xl font-black text-white">Falar no WhatsApp</h2>
          <p className="mt-1 text-sm text-white/50">Preencha rapidinho e fale agora!</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            required
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Nome completo"
            className={inputClass}
          />
          <input
            required
            value={empresa}
            onChange={(e) => setEmpresa(e.target.value)}
            placeholder="Nome da empresa"
            className={inputClass}
          />
          <input
            required
            value={telefone}
            onChange={(e) => setTelefone(e.target.value)}
            placeholder="Telefone / WhatsApp"
            className={inputClass}
          />
          <button
            type="submit"
            disabled={loading}
            className="mt-2 flex items-center justify-center gap-2 rounded-xl bg-[#25D366] py-3.5 text-sm font-bold text-white shadow-lg shadow-[#25D366]/25 transition hover:-translate-y-0.5 hover:bg-[#20ba5a] disabled:opacity-60"
          >
            Falar agora no WhatsApp →
          </button>
        </form>
      </div>
    </div>
  );
}

export default function NavbarOferta() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <nav className="fixed left-0 right-0 top-0 z-50 flex max-h-[56px] items-center justify-between border-b border-white/[0.06] bg-[#050505]/90 px-6 py-3 backdrop-blur-md">
        <Link href="https://cspnexora.com.br" target="_blank" rel="noopener noreferrer">
          <Image src="/logo.png" alt="CSP Nexora" width={120} height={66} className="h-auto w-[80px] object-contain" priority />
        </Link>
        <div className="flex items-center gap-3">
          <div className="hidden sm:block border border-cyan-500/30 bg-cyan-500/10 text-cyan-400 text-[10px] font-semibold tracking-widest px-3 py-1 rounded-full">
            WhatsApp (61) 9 8420-2578 &nbsp;|&nbsp; E-mail: contato@cspnexora.com.br
          </div>
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-1.5 rounded-xl bg-[#25D366] px-4 py-1.5 text-xs font-bold text-white shadow-md shadow-[#25D366]/25 transition hover:-translate-y-0.5 hover:bg-[#20ba5a]"
          >
            💬 Falar no WhatsApp
          </button>
        </div>
      </nav>

      {modalOpen && <WhatsAppModal onClose={() => setModalOpen(false)} />}
    </>
  );
}
