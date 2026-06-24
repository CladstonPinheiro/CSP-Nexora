"use client";

import { motion } from "motion/react";
import { Check } from "lucide-react";

const entregaItems = [
  "Site profissional, moderno e responsivo",
  "Domínio .com.br próprio (conforme disponibilidade)",
  "Até 3 e-mails profissionais",
  "Hospedagem robusta por 12 meses",
  "Certificado SSL/TLS (cadeado 🔒)",
  "Integração com WhatsApp e redes sociais",
  "Formulário de contato funcional",
  "Mapa e localização integrados",
  "Entrega em até 24 horas",
  "Suporte pós-entrega incluso",
  "Dados reais do seu negócio no site",
  "Zero mensalidade no primeiro ano",
];

const features = [
  "Site profissional e responsivo",
  "Domínio .com.br por 12 meses",
  "3 e-mails profissionais",
  "Hospedagem + SSL/TLS",
  "Entrega em 24h",
  "Suporte pós-entrega",
];

const planos = [
  {
    label: "Pagamento à vista",
    price: "R$ 500",
    period: "pagamento único no PIX",
    desc: "Melhor custo-benefício. Paga uma vez e fica tranquilo por 1 ano completo.",
    cta: "💳 Pagar R$ 500 via PIX",
    href: "https://cobranca.c6pix.com.br/01KVWPSBMJGNT5RGJJ15RJR5W4",
    destaque: false,
  },
  {
    label: "Parcelado em 2×",
    price: "2× R$ 350",
    period: "= R$ 700 no PIX",
    desc: "Divide em dois pagamentos e mantém o fluxo do caixa equilibrado.",
    cta: "💳 Pagar 1ª parcela R$ 350",
    href: "https://cobranca.c6pix.com.br/01KVWPV2F734R3ADNV2HVC04A4",
    destaque: true,
    badge: "⭐ Mais escolhido",
  },
  {
    label: "Parcelado em 12×",
    price: "12× R$ 120",
    period: "= R$ 1.440 no PIX",
    desc: "Facilidade máxima. Invista no seu negócio com o menor impacto mensal.",
    cta: "💳 Pagar 1ª parcela R$ 120",
    href: "https://cobranca.c6pix.com.br/01KVWPW4GSM5C5SY58JSFE5S2M",
    destaque: false,
  },
];

const steps = [
  { n: "1", title: "Você viu seu site de demonstração", desc: "Já montamos uma versão do seu site com seus dados reais do Google Meu Negócio. É só conferir o link que enviamos." },
  { n: "2", title: "Escolhe o plano e paga no PIX", desc: "Escolha à vista, 2× ou 12×. Pagamento 100% via PIX, pré-pago e sem burocracia." },
  { n: "3", title: "Registramos seu domínio .com.br", desc: "Verificamos a disponibilidade e registramos seu domínio. Você escolhe o nome que preferir." },
  { n: "4", title: "Site publicado e funcionando", desc: "Em até 24h seu site está no ar com hospedagem robusta, SSL ativo e tudo configurado." },
];

export function EntregaSection() {
  return (
    <section className="bg-white/[0.02] px-6 py-24">
      <div className="mx-auto max-w-5xl">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
          <span className="inline-block rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-1 text-xs font-bold uppercase tracking-widest text-blue-400">Tudo incluso</span>
          <h2 className="font-outfit mt-4 text-3xl font-black tracking-tight text-white sm:text-4xl">
            Tudo o que você recebe no <em className="not-italic text-cyan-400">primeiro ano</em>
          </h2>
          <p className="mt-3 max-w-lg text-sm leading-relaxed text-white/50">Sem pegadinha, sem mensalidade escondida. Uma única vez e pronto.</p>
        </motion.div>
        <div className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {entregaItems.map((item, i) => (
            <motion.div key={item} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.05 }}
              className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-3.5">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-emerald-500/30 bg-emerald-500/10">
                <Check className="h-3.5 w-3.5 text-emerald-400" strokeWidth={2.5} />
              </div>
              <span className="text-sm font-medium text-white/80">{item}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function ProcessoSection() {
  return (
    <section className="px-6 py-24">
      <div className="mx-auto max-w-3xl">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
          <span className="inline-block rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-1 text-xs font-bold uppercase tracking-widest text-cyan-400">Como funciona</span>
          <h2 className="font-outfit mt-4 text-3xl font-black tracking-tight text-white sm:text-4xl">
            Do zero ao ar em <em className="not-italic text-cyan-400">24 horas</em>
          </h2>
        </motion.div>
        <div className="mt-12 flex flex-col gap-0">
          {steps.map((s, i) => (
            <motion.div key={s.n} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.45, delay: i * 0.1 }}
              className="flex gap-6">
              <div className="flex flex-col items-center">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-cyan-500 text-sm font-black text-white">{s.n}</div>
                {i < steps.length - 1 && <div className="mt-1 w-px flex-1 bg-gradient-to-b from-blue-600/40 to-transparent" style={{ minHeight: 40 }} />}
              </div>
              <div className="pb-10">
                <h3 className="text-sm font-bold text-white">{s.title}</h3>
                <p className="mt-1 text-xs leading-relaxed text-white/50">{s.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function PlanosSection() {
  return (
    <section id="planos" className="bg-white/[0.02] px-6 py-24">
      <div className="mx-auto max-w-5xl">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="text-center">
          <span className="inline-block rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-1 text-xs font-bold uppercase tracking-widest text-blue-400">Planos promocionais</span>
          <h2 className="font-outfit mt-4 text-3xl font-black tracking-tight text-white sm:text-4xl">
            Escolha a forma de pagamento <em className="not-italic text-cyan-400">ideal para você</em>
          </h2>
          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-white/50">Todos os planos incluem exatamente os mesmos recursos. Só muda a forma de pagar.</p>
        </motion.div>
        <div className="mt-12 grid gap-6 sm:grid-cols-3">
          {planos.map((p, i) => (
            <motion.div key={p.label} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.45, delay: i * 0.1 }}
              className={`relative flex flex-col rounded-2xl border p-7 transition hover:-translate-y-1 ${p.destaque ? "border-cyan-500/40 bg-gradient-to-b from-cyan-500/[0.08] to-blue-600/[0.06]" : "border-white/[0.06] bg-white/[0.03]"}`}>
              {p.badge && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 px-4 py-1 text-xs font-bold text-white">{p.badge}</div>
              )}
              <p className="text-xs font-bold uppercase tracking-widest text-white/40">{p.label}</p>
              <div className="mt-3"><span className="font-outfit text-3xl font-black text-white">{p.price}</span></div>
              <p className="mt-0.5 text-xs text-white/40">{p.period}</p>
              <p className="mt-3 text-xs leading-relaxed text-white/50">{p.desc}</p>
              <ul className="my-6 flex flex-col gap-2.5">
                {features.map((f) => (
                  <li key={f} className="flex items-center gap-2.5 text-xs text-white/70">
                    <Check className="h-3.5 w-3.5 shrink-0 text-emerald-400" strokeWidth={2.5} />{f}
                  </li>
                ))}
              </ul>
              <a href={p.href} target="_blank" rel="noopener noreferrer"
                className={`mt-auto block rounded-xl py-3 text-center text-sm font-bold text-white transition hover:-translate-y-0.5 ${p.destaque ? "bg-blue-600 shadow-lg shadow-blue-600/30 hover:bg-blue-500" : "bg-white/[0.08] hover:bg-white/[0.14]"}`}>
                {p.cta} →
              </a>
            </motion.div>
          ))}
        </div>
        <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-8 text-center text-xs text-white/30">
          💳 Todos os planos são pré-pagos · Pagamento exclusivo via PIX · Sem mensalidade no 1º ano
        </motion.p>
      </div>
    </section>
  );
}
