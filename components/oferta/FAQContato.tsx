"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronDown } from "lucide-react";

const faqs = [
  { q: "O site realmente fica pronto em 24 horas?", a: "Sim! Toda a estrutura já está pronta com seus dados reais (como você viu no link de demonstração). Após a confirmação do pagamento, registramos seu domínio e publicamos em até 24 horas úteis." },
  { q: "Depois do 1º ano, quanto custa para manter?", a: "Ao final dos 12 meses, você pode renovar a hospedagem e o domínio por valores bem acessíveis. Nossa equipe entra em contato antes do vencimento. Não há surpresas." },
  { q: "Posso personalizar o site depois de publicado?", a: "Sim! Podemos implementar CRM, dashboards, automações com IA, chatbot e muito mais. Cada implementação adicional é orçada separadamente conforme suas necessidades." },
  { q: "E se meu domínio .com.br não estiver disponível?", a: "Consultamos a disponibilidade antes de confirmar. Se o domínio desejado estiver ocupado, apresentamos alternativas para você escolher." },
  { q: "O site funciona bem no celular?", a: "100%. Todos os sites são desenvolvidos com design responsivo e mobile-first, funcionando perfeitamente em smartphones, tablets e desktops." },
  { q: "Qual a diferença entre os planos?", a: "Apenas a forma de pagamento. Todos os planos incluem exatamente os mesmos recursos. O plano à vista é o de menor valor total." },
];

export function FAQSection() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section className="px-6 py-24">
      <div className="mx-auto max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <span className="inline-block rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-1 text-xs font-bold uppercase tracking-widest text-blue-400">
            Dúvidas frequentes
          </span>
          <h2 className="font-outfit mt-4 text-3xl font-black tracking-tight text-white sm:text-4xl">
            Perguntas que todo mundo faz
          </h2>
        </motion.div>

        <div className="mt-10 flex flex-col gap-3">
          {faqs.map((f, i) => (
            <motion.div
              key={f.q}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.06 }}
              className="overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.03]"
            >
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="flex w-full items-center justify-between px-6 py-5 text-left text-sm font-semibold text-white transition hover:text-cyan-400"
              >
                {f.q}
                <ChevronDown
                  className={`h-4 w-4 shrink-0 text-white/40 transition-transform duration-300 ${open === i ? "rotate-180 text-cyan-400" : ""}`}
                />
              </button>
              <AnimatePresence initial={false}>
                {open === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                  >
                    <p className="px-6 pb-5 text-xs leading-relaxed text-white/50">{f.a}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function ContatoSection() {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    const form = e.currentTarget;
    const data = new FormData(form);
    const plano = data.get("plano") as string | null;
    const body = {
      nome:    data.get("nome"),
      email:   data.get("email"),
      empresa: data.get("negocio"),
      telefone: data.get("whatsapp"),
      niche:   null,
      source:  "prospeccao_ia",
      stage:   "identificado",
      notes:   plano ? `Lead GMN — ${plano}` : "Lead GMN",
    };
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("request failed");
      setStatus("sent");
    } catch {
      setStatus("error");
    }
  }

  return (
    <section id="contato" className="bg-white/[0.02] px-6 py-24">
      <div className="mx-auto max-w-xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <span className="inline-block rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-1 text-xs font-bold uppercase tracking-widest text-cyan-400">
            Fale conosco
          </span>
          <h2 className="font-outfit mt-4 text-3xl font-black tracking-tight text-white sm:text-4xl">
            Tem dúvidas?{" "}
            <em className="not-italic text-cyan-400">Fale com a gente</em>
          </h2>
          <p className="mt-3 text-sm text-white/50">
            Nossa equipe responde rapidinho. Preencha o formulário ou chame no WhatsApp.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mt-10 rounded-2xl border border-white/[0.06] bg-white/[0.03] p-8"
        >
          {status === "sent" ? (
            <div className="py-10 text-center">
              <p className="text-2xl">✅</p>
              <p className="mt-3 text-sm font-semibold text-emerald-400">Mensagem enviada!</p>
              <p className="mt-1 text-xs text-white/50">Entraremos em contato pelo WhatsApp em breve.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <input type="hidden" name="identificador" value="GMN" />
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-white/40">Nome *</label>
                  <input name="nome" required placeholder="João Silva"
                    className="rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-3 text-sm text-white placeholder-white/20 outline-none transition focus:border-blue-500/60" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-white/40">WhatsApp *</label>
                  <input name="whatsapp" required placeholder="(61) 9 0000-0000"
                    className="rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-3 text-sm text-white placeholder-white/20 outline-none transition focus:border-blue-500/60" />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-white/40">E-mail *</label>
                <input name="email" type="email" required placeholder="seu@email.com"
                  className="rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-3 text-sm text-white placeholder-white/20 outline-none transition focus:border-blue-500/60" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-white/40">Nome do negócio *</label>
                <input name="negocio" required placeholder="Ex: Padaria do João"
                  className="rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-3 text-sm text-white placeholder-white/20 outline-none transition focus:border-blue-500/60" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-white/40">Plano de interesse</label>
                <select name="plano"
                  className="rounded-xl border border-white/[0.08] bg-[#0a0a0a] px-4 py-3 text-sm text-white/70 outline-none transition focus:border-blue-500/60">
                  <option value="">Selecione...</option>
                  <option value="avista">À vista — R$ 500</option>
                  <option value="2x">2× R$ 350</option>
                  <option value="12x">12× R$ 120</option>
                  <option value="duvida">Tenho dúvidas</option>
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-white/40">Mensagem</label>
                <textarea name="mensagem" rows={4} placeholder="Conte um pouco sobre o seu negócio..."
                  className="resize-none rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-3 text-sm text-white placeholder-white/20 outline-none transition focus:border-blue-500/60" />
              </div>
              <button type="submit" disabled={status === "sending"}
                className="mt-2 rounded-xl bg-blue-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-600/25 transition hover:-translate-y-0.5 hover:bg-blue-500 disabled:opacity-60">
                {status === "sending" ? "Enviando..." : "Enviar mensagem →"}
              </button>
              {status === "error" && (
                <p className="text-center text-xs text-red-400">Erro ao enviar. Tente novamente ou chame no WhatsApp.</p>
              )}
            </form>
          )}
        </motion.div>
      </div>
    </section>
  );
}
