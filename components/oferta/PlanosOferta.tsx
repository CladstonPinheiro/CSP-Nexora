"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { Check, Copy, CheckCheck, X } from "lucide-react";
import Image from "next/image";

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
  "Zero mensalidade ou taxa",
];

const defaultFeatures = [
  "Site profissional e responsivo",
  "Domínio .com.br por 12 meses",
  "3 e-mails profissionais",
  "Hospedagem + SSL/TLS",
  "Entrega em 24h",
  "Suporte pós-entrega",
];

const consultaFeatures = [
  "Site profissional e responsivo",
  "Domínio .com.br por 12 meses",
  "3 e-mails profissionais",
  "Hospedagem + SSL/TLS",
  "Prazo conforme escopo do projeto",
  "Suporte pós-entrega",
  "Integrações personalizadas com IA",
  "Chatbot e automações sob medida",
  "CRM e dashboards personalizados",
];

type Plano = {
  label: string;
  price: string;
  period: string;
  desc: string;
  cta: string;
  destaque: boolean;
  badge?: string;
  isConsulta?: boolean;
  features?: string[];
  qrCode?: string;
  chavePix?: string;
};

const planos: Plano[] = [
  {
    label: "Pagamento à vista",
    price: "R$ 500",
    period: "pagamento único no PIX",
    desc: "Melhor custo-benefício. Paga uma vez e fica tranquilo por 1 ano completo.",
    cta: "💳 Pagar R$ 500 via PIX",
    destaque: false,
    qrCode: "https://i.ibb.co/n8ZBcrb0/QR-CODE-500.png",
    chavePix: "00020101021126580014br.gov.bcb.pix0136758f6005-f0aa-4b00-a23e-d02c71f2fb085204000053039865406500.005802BR5925CLADSTON DA SILVA PINHEIR6009SAO PAULO622905251KVWPSC6MEQ7Q47WR8HN3WM746304C1DF",
  },
  {
    label: "Parcelado em 2×",
    price: "2× R$ 350",
    period: "= R$ 700 no PIX",
    desc: "Divide em dois pagamentos e mantém o fluxo do caixa equilibrado.",
    cta: "💳 Pagar 1ª parcela R$ 350",
    destaque: true,
    badge: "⭐ Mais escolhido",
    qrCode: "https://i.ibb.co/gLmRVHVd/QR-CODE-350.png",
    chavePix: "00020101021126580014br.gov.bcb.pix0136758f6005-f0aa-4b00-a23e-d02c71f2fb085204000053039865406350.005802BR5925CLADSTON DA SILVA PINHEIR6009SAO PAULO622905251KVWPV319Y8FZNK8A63N8PNY96304776C",
  },
  {
    label: "Sob Consulta",
    price: "Sob Consulta",
    period: "Implementações personalizadas",
    desc: "Soluções sob medida para o seu negócio. Escopo, prazo e investimento definidos juntos.",
    cta: "💬 Quero uma proposta personalizada",
    destaque: false,
    isConsulta: true,
    features: consultaFeatures,
  },
];

function gerarCodigo(): string {
  const now = new Date();
  const dd = String(now.getDate()).padStart(2, "0");
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const rand = String(Math.floor(Math.random() * 9000) + 1000);
  return `GMN-${dd}${mm}-${rand}`;
}

type Etapa = "identificacao" | "pagamento";

interface PixModalProps {
  plano: Plano;
  onClose: () => void;
}

function PixModal({ plano, onClose }: PixModalProps) {
  const [etapa, setEtapa] = useState<Etapa>("identificacao");
  const [nome, setNome] = useState("");
  const [empresa, setEmpresa] = useState("");
  const [telefone, setTelefone] = useState("");
  const [codigo] = useState(gerarCodigo);
  const [copiado, setCopiado] = useState(false);
  const [loading, setLoading] = useState(false);

  const inputClass =
    "w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-3 text-sm text-white placeholder-white/20 outline-none transition focus:border-cyan-500/50";

  async function handleIdentificacao(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome,
          empresa,
          telefone,
          email: "",
          source: "prospeccao_gmn",
          stage: "proposta_enviada",
          notes: `Lead GMN — pagamento iniciado — ${plano.label} — código: ${codigo}`,
        }),
      });
    } catch {}
    setLoading(false);
    setEtapa("pagamento");
  }

  function copiarChave() {
    navigator.clipboard.writeText(plano.chavePix!);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2500);
  }

  function confirmarPagamento() {
    const msg = encodeURIComponent(
      `Olá! Efetuei o pagamento do ${plano.label}. Meu código é ${codigo}. Nome: ${nome}. Empresa: ${empresa}. Segue em anexo o comprovante do pagamento PIX.`
    );
    window.open(`https://wa.me/5561984202578?text=${msg}`, "_blank");
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md rounded-2xl border border-white/[0.06] bg-[#0a0a0a] shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/[0.06] px-6 py-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-white/40">
              {etapa === "identificacao" ? "Seus dados" : "Pagamento PIX"}
            </p>
            <p className="font-outfit text-base font-black text-white">{plano.label} — {plano.price}</p>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 text-white/40 transition hover:bg-white/10 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-6">
          {etapa === "identificacao" ? (
            <form onSubmit={handleIdentificacao} className="flex flex-col gap-4">
              <p className="text-sm text-white/50">Informe seus dados para continuar com o pagamento.</p>
              <input required value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Nome completo" className={inputClass} />
              <input required value={empresa} onChange={(e) => setEmpresa(e.target.value)} placeholder="Nome da empresa" className={inputClass} />
              <input required value={telefone} onChange={(e) => setTelefone(e.target.value)} placeholder="Telefone / WhatsApp" maxLength={11} className={inputClass} />
              <button
                type="submit"
                disabled={loading}
                className="mt-2 rounded-xl bg-blue-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-600/25 transition hover:-translate-y-0.5 hover:bg-blue-500 disabled:opacity-60"
              >
                {loading ? "Aguarde..." : "Continuar para pagamento →"}
              </button>
            </form>
          ) : (
            <div className="flex flex-col items-center gap-5">
              {/* Código único */}
              <div className="w-full rounded-xl border border-cyan-500/20 bg-cyan-500/5 px-4 py-3 text-center">
                <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-1">Seu código de pagamento</p>
                <p className="font-outfit text-xl font-black tracking-widest text-cyan-400">{codigo}</p>
              </div>

              {/* QR Code */}
              <div className="rounded-2xl border border-white/[0.06] bg-white p-3">
                <Image
                  src={plano.qrCode!}
                  alt={`QR Code ${plano.label}`}
                  width={200}
                  height={200}
                  className="h-[200px] w-[200px] object-contain"
                  unoptimized
                />
              </div>

              <p className="text-xs text-white/40 text-center">
                Escaneie o QR Code acima ou copie a chave PIX abaixo
              </p>

              {/* Chave PIX */}
              <button
                onClick={copiarChave}
                className="flex w-full items-center gap-3 rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 transition hover:bg-white/[0.06]"
              >
                {copiado ? (
                  <CheckCheck className="h-4 w-4 shrink-0 text-emerald-400" />
                ) : (
                  <Copy className="h-4 w-4 shrink-0 text-white/40" />
                )}
                <span className="flex-1 truncate text-left text-xs text-white/50">
                  {copiado ? "Chave copiada!" : plano.chavePix}
                </span>
                <span className={`shrink-0 text-xs font-bold ${copiado ? "text-emerald-400" : "text-cyan-400"}`}>
                  {copiado ? "Copiado!" : "Copiar chave PIX"}
                </span>
              </button>

              {/* Confirmar pagamento */}
              <button
                onClick={confirmarPagamento}
                className="w-full rounded-xl bg-[#25D366] py-3.5 text-sm font-bold text-white shadow-lg shadow-[#25D366]/25 transition hover:-translate-y-0.5 hover:bg-[#20ba5a]"
              >
                ✅ Já paguei — confirmar pelo WhatsApp
              </button>

              <p className="text-xs text-white/40 text-center">
                📎 Ao abrir o WhatsApp, anexe o comprovante de pagamento para agilizar a ativação do seu site.
              </p>
              <p className="text-[10px] text-white/30 text-center">
                Após o pagamento, nossa equipe ativa seu site em até 24h úteis.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ConsultaModal({ onClose }: { onClose: () => void }) {
  const [nome, setNome] = useState("");
  const [empresa, setEmpresa] = useState("");
  const [telefone, setTelefone] = useState("");
  const [loading, setLoading] = useState(false);

  const inputClass =
    "w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-3 text-sm text-white placeholder-white/20 outline-none transition focus:border-cyan-500/50";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    // Abre WhatsApp ANTES do await para não ser bloqueado pelo browser
    const msg = encodeURIComponent(
      `Oi! Me chamo ${nome}, tenho interesse no plano personalizado da CSP Nexora para o meu negócio ${empresa}. Podem me passar mais detalhes?`
    );
    window.open(`https://wa.me/5561984202578?text=${msg}`, "_blank");

    // Depois registra o lead
    try {
      await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome,
          empresa,
          telefone,
          email: "",
          source: "prospeccao_gmn",
          stage: "proposta_enviada",
          notes: "Lead GMN — interesse em plano personalizado (Sob Consulta)",
        }),
      });
    } catch {}

    setLoading(false);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md rounded-2xl border border-white/[0.06] bg-[#0a0a0a] shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between border-b border-white/[0.06] px-6 py-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-white/40">Plano personalizado</p>
            <p className="font-outfit text-base font-black text-white">Sob Consulta — Proposta personalizada</p>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 text-white/40 transition hover:bg-white/10 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="p-6">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <p className="text-sm text-white/50">Informe seus dados e entraremos em contato com uma proposta personalizada.</p>
            <input required value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Nome completo" className={inputClass} />
            <input required value={empresa} onChange={(e) => setEmpresa(e.target.value)} placeholder="Nome da empresa" className={inputClass} />
            <input required value={telefone} onChange={(e) => setTelefone(e.target.value)} placeholder="Telefone / WhatsApp" maxLength={11} className={inputClass} />
            <button
              type="submit"
              disabled={loading}
              className="mt-2 rounded-xl bg-[#25D366] py-3.5 text-sm font-bold text-white shadow-lg shadow-[#25D366]/25 transition hover:-translate-y-0.5 hover:bg-[#20ba5a] disabled:opacity-60"
            >
              {loading ? "Aguarde..." : "💬 Enviar mensagem no WhatsApp →"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export function EntregaSection() {
  return (
    <section className="bg-white/[0.02] px-6 py-24">
      <div className="mx-auto max-w-5xl">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
          <span className="inline-block rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-1 text-xs font-bold uppercase tracking-widest text-blue-400">Tudo incluso</span>
          <h2 className="font-outfit mt-4 text-3xl font-black tracking-tight text-white sm:text-4xl">
            Tudo o que você recebe <em className="not-italic text-cyan-400">contratando agora</em>
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
  const steps = [
    { n: "1", title: "Você viu seu site de demonstração", desc: "Já montamos uma versão do seu site com seus dados reais do Google Meu Negócio. É só conferir o link que enviamos." },
    { n: "2", title: "Escolhe o plano e paga no PIX", desc: "Escolha à vista, 2× ou 12×. Pagamento 100% via PIX, pré-pago e sem burocracia." },
    { n: "3", title: "Registramos seu domínio .com.br", desc: "Verificamos a disponibilidade e registramos seu domínio. Você escolhe o nome que preferir." },
    { n: "4", title: "Site publicado e funcionando", desc: "Em até 24h seu site está no ar com hospedagem robusta, SSL ativo e tudo configurado." },
  ];

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
  const [planoSelecionado, setPlanoSelecionado] = useState<Plano | null>(null);
  const [showConsulta, setShowConsulta] = useState(false);

  return (
    <>
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
                  {(p.features ?? defaultFeatures).map((f) => (
                    <li key={f} className="flex items-center gap-2.5 text-xs text-white/70">
                      <Check className="h-3.5 w-3.5 shrink-0 text-emerald-400" strokeWidth={2.5} />{f}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => p.isConsulta ? setShowConsulta(true) : setPlanoSelecionado(p)}
                  className="mt-auto block w-full rounded-xl border border-orange-500/40 bg-orange-500/20 py-3 text-center text-sm font-bold text-orange-400 backdrop-blur-sm transition hover:-translate-y-0.5 hover:bg-orange-500/30">
                  {p.isConsulta ? "Contatar" : "Contratar"}
                </button>
              </motion.div>
            ))}
          </div>
          <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-8 text-center text-xs text-white/30">
            💳 Todos os planos são pré-pagos · Pagamento exclusivo via PIX · Sem mensalidade no 1º ano
          </motion.p>
        </div>
      </section>

      {planoSelecionado && (
        <PixModal plano={planoSelecionado} onClose={() => setPlanoSelecionado(null)} />
      )}
      {showConsulta && (
        <ConsultaModal onClose={() => setShowConsulta(false)} />
      )}
    </>
  );
}
