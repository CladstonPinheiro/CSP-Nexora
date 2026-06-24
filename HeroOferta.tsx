"use client";

import { motion } from "motion/react";
import { Zap, Globe, Mail, Shield } from "lucide-react";

const stats = [
  { num: "24h", lbl: "Entrega garantida" },
  { num: "R$0", lbl: "Mensalidade" },
  { num: "3", lbl: "E-mails profissionais" },
  { num: "1 ano", lbl: "Hospedagem inclusa" },
];

const ticker = [
  "⚡ Site pronto em 24h",
  "🌐 Domínio .com.br incluso",
  "📧 E-mails profissionais",
  "🔒 SSL/TLS gratuito",
  "📱 100% responsivo",
  "🤖 Integrações com IA",
  "📍 Google Maps integrado",
  "💬 Botão WhatsApp",
];

export default function HeroOferta() {
  return (
    <>
      {/* ── TICKER ── */}
      <div className="w-full overflow-hidden bg-gradient-to-r from-blue-600 to-cyan-500 py-2.5">
        <div className="flex animate-ticker whitespace-nowrap">
          {[...ticker, ...ticker].map((item, i) => (
            <span
              key={i}
              className="mx-10 text-xs font-semibold uppercase tracking-widest text-white"
            >
              {item}
            </span>
          ))}
        </div>
      </div>

      {/* ── HERO ── */}
      <section className="relative flex min-h-[90vh] flex-col items-center justify-center overflow-hidden px-6 py-24 text-center">
        {/* Orbs */}
        <div className="pointer-events-none absolute inset-0">
          <motion.div
            animate={{ scale: [1, 1.15, 1], opacity: [0.18, 0.28, 0.18] }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-32 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-blue-600 blur-[120px]"
          />
          <motion.div
            animate={{ scale: [1, 1.1, 1], opacity: [0.12, 0.2, 0.12] }}
            transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            className="absolute bottom-0 right-1/4 h-[400px] w-[400px] rounded-full bg-cyan-500 blur-[100px]"
          />
        </div>

        <div className="relative z-10 mx-auto max-w-4xl">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-7 inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-cyan-400"
          >
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-cyan-400" />
            Oferta por tempo limitado
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.1 }}
            className="font-outfit text-4xl font-black leading-[1.1] tracking-tight text-white sm:text-5xl lg:text-6xl"
          >
            Seu negócio merece um site que{" "}
            <em className="not-italic text-cyan-400">trabalha por você</em>
          </motion.h1>

          {/* Sub */}
          <motion.p
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.2 }}
            className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-white/60 sm:text-lg"
          >
            Você está no Google Meu Negócio — ótimo. Mas sem um site profissional,
            você perde clientes todo dia. A CSP Nexora resolve isso em{" "}
            <strong className="text-white">24 horas</strong>.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.3 }}
            className="mt-10 flex flex-wrap items-center justify-center gap-3"
          >
            <a
              href="#planos"
              className="rounded-xl bg-blue-600 px-8 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-600/40 transition hover:-translate-y-0.5 hover:bg-blue-500 hover:shadow-blue-500/50"
            >
              Quero meu site agora →
            </a>
            <a
              href="#beneficios"
              className="rounded-xl border border-white/10 px-8 py-3.5 text-sm font-semibold text-white/80 transition hover:border-white/25 hover:text-white"
            >
              Ver benefícios
            </a>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.4 }}
            className="mt-16 flex flex-wrap justify-center gap-10"
          >
            {stats.map((s) => (
              <div key={s.lbl} className="text-center">
                <div className="font-outfit text-3xl font-black text-cyan-400">{s.num}</div>
                <div className="mt-1 text-xs font-semibold uppercase tracking-widest text-white/40">
                  {s.lbl}
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>
    </>
  );
}
