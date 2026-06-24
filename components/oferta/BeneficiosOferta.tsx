"use client";

import { motion, Variants } from "motion/react";
import {
  TrendingDown, DoorClosed, ShieldAlert, BarChart2,
  Target, Search, Briefcase, Smartphone, MapPin, Bot,
} from "lucide-react";

const problemas = [
  { icon: TrendingDown, title: "Anúncios pagando mais caro", desc: "Facebook, Google e TikTok reduzem alcance e aumentam o CPC de empresas sem site. Você paga mais e alcança menos." },
  { icon: DoorClosed, title: "Porta de entrada bloqueada", desc: "Quando alguém pesquisa seu serviço fora do Google Meu Negócio, você simplesmente não existe. Clientes vão para quem tem site." },
  { icon: ShieldAlert, title: "Credibilidade questionada", desc: "Em 2025, empresa sem site profissional parece amadora. Clientes potenciais desconfiam e preferem a concorrência." },
  { icon: BarChart2, title: "Dados e métricas perdidos", desc: "Sem site, você não sabe quantas pessoas te procuram, de onde vêm, o que buscam. Decisão sem dado é chute." },
];

const beneficios = [
  { icon: Target, title: "Anúncios muito mais baratos", desc: "Facebook, Google e TikTok priorizam empresas com site profissional. Seu custo por clique cai e o ROI dispara." },
  { icon: Search, title: "Aparece no orgânico", desc: "Um site otimizado aparece nas buscas espontâneas. Clientes que nunca ouviram falar de você chegam sozinhos." },
  { icon: Briefcase, title: "Imagem profissional instantânea", desc: "Ao receber o link do seu site, o cliente percebe que você é sério, estruturado e confiável. Fecha mais e melhor." },
  { icon: Smartphone, title: "Redes sociais potencializadas", desc: "Instagram, LinkedIn e Facebook convertem muito mais quando o cliente pode acessar seu site com um clique." },
  { icon: MapPin, title: "Localização e contato integrados", desc: "Mapa, WhatsApp, formulário e redes sociais em um só lugar. Zero fricção para o cliente entrar em contato." },
  { icon: Bot, title: "Pronto para crescer com IA", desc: "CRM, automações, chatbot, dashboards — sua estrutura digital cresce junto com o negócio, quando você quiser." },
];

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.5, delay: i * 0.08, ease: "easeOut" as const },
  }),
};

export function ProblemaSection() {
  return (
    <section className="bg-white/[0.02] px-6 py-24">
      <div className="mx-auto max-w-5xl">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
          <span className="inline-block rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-1 text-xs font-bold uppercase tracking-widest text-blue-400">O problema</span>
          <h2 className="font-outfit mt-4 text-3xl font-black tracking-tight text-white sm:text-4xl">
            Estar no Google Meu Negócio <em className="not-italic text-cyan-400">não é suficiente</em>
          </h2>
          <p className="mt-3 max-w-lg text-sm leading-relaxed text-white/50">Seus concorrentes com site profissional estão convertendo clientes que deveriam ser seus.</p>
        </motion.div>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {problemas.map((p, i) => (
            <motion.div key={p.title} custom={i} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
              className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-6 transition hover:-translate-y-1 hover:border-blue-500/30">
              <p.icon className="mb-4 h-7 w-7 text-blue-400" strokeWidth={1.5} />
              <h3 className="mb-2 text-sm font-bold text-white">{p.title}</h3>
              <p className="text-xs leading-relaxed text-white/50">{p.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function BeneficiosSection() {
  return (
    <section id="beneficios" className="px-6 py-24">
      <div className="mx-auto max-w-5xl">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
          <span className="inline-block rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-1 text-xs font-bold uppercase tracking-widest text-cyan-400">Por que ter um site</span>
          <h2 className="font-outfit mt-4 text-3xl font-black tracking-tight text-white sm:text-4xl">
            Seu site vende enquanto você <em className="not-italic text-cyan-400">dorme</em>
          </h2>
          <p className="mt-3 max-w-lg text-sm leading-relaxed text-white/50">Um site moderno não é custo — é o seu melhor vendedor, disponível 24/7.</p>
        </motion.div>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {beneficios.map((b, i) => (
            <motion.div key={b.title} custom={i} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
              className="flex gap-4 rounded-2xl border border-white/[0.06] bg-white/[0.03] p-6 transition hover:-translate-y-1 hover:border-cyan-500/25">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600/25 to-cyan-500/15">
                <b.icon className="h-5 w-5 text-cyan-400" strokeWidth={1.5} />
              </div>
              <div>
                <h3 className="mb-1.5 text-sm font-bold text-white">{b.title}</h3>
                <p className="text-xs leading-relaxed text-white/50">{b.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

const comparativo = [
  {
    funcionalidade: "Alcance de Público",
    sem: "Só para quem já te conhece",
    com: "Aparece para quem busca seu serviço sem te conhecer",
  },
  {
    funcionalidade: "Vendas e Agendamentos",
    sem: "Depende de ligação ou WhatsApp",
    com: "Vendas e agendamentos automáticos 24h",
  },
  {
    funcionalidade: "Credibilidade",
    sem: "Só pelas avaliações do Google",
    com: "Autoridade e estrutura própria da marca",
  },
  {
    funcionalidade: "Vitrine de Produtos",
    sem: "Fotos isoladas na galeria",
    com: "Catálogo com preços, descrições e botão de compra",
  },
];

export function GoogleComparativoSection() {
  return (
    <section className="bg-white/[0.02] px-6 py-24">
      <div className="mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <span className="inline-block rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-1 text-xs font-bold uppercase tracking-widest text-blue-400">
            Fonte: Google
          </span>
          <h2 className="font-outfit mt-4 text-3xl font-black tracking-tight text-white sm:text-4xl">
            O que o Google diz sobre <em className="not-italic text-cyan-400">ter um site</em>
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="mt-12 overflow-hidden rounded-2xl border border-white/[0.06]"
        >
          {/* Header */}
          <div className="grid grid-cols-3 bg-white/[0.04] px-6 py-3">
            <p className="text-[10px] font-black uppercase tracking-widest text-white/40">Funcionalidade</p>
            <p className="text-[10px] font-black uppercase tracking-widest text-rose-400">GMN SEM Site</p>
            <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400">GMN COM Site</p>
          </div>

          {comparativo.map((row, i) => (
            <motion.div
              key={row.funcionalidade}
              initial={{ opacity: 0, x: -12 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="grid grid-cols-3 border-t border-white/[0.06] bg-white/[0.03] px-6 py-4 hover:bg-white/[0.05] transition-colors"
            >
              <p className="text-sm font-semibold text-white/70 pr-4">{row.funcionalidade}</p>
              <div className="flex items-start gap-2 pr-4">
                <span className="mt-0.5 shrink-0">❌</span>
                <p className="text-xs leading-relaxed text-rose-400">{row.sem}</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="mt-0.5 shrink-0">✅</span>
                <p className="text-xs leading-relaxed text-emerald-400">{row.com}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
