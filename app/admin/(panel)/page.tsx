import { createAdminClient } from '@/lib/supabase';
import { Users, TrendingUp, Building2, CheckSquare, ArrowUpRight } from 'lucide-react';
import { STAGE_ORDER, estagioConfig, scoreConfig } from './leads/_components/types';

type LeadRow = {
  id: string;
  created_at: string;
  stage?: string | null;
  ai_score?: string | null;
  ai_qualified_at?: string | null;
};

type ProjetoRow = {
  setup_value?: number | null;
  monthly_value?: number | null;
};

async function getMetrics() {
  const supabase = createAdminClient();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [leadsRes, clientesRes, tarefasRes, projetosRes, leadsSiteRes, leadsGmnRes] = await Promise.allSettled([
    supabase.from('leads').select('id, created_at, stage, ai_score, ai_qualified_at'),
    supabase.from('clientes').select('id', { count: 'exact', head: true }).eq('status', 'ativo'),
    supabase.from('tarefas').select('id', { count: 'exact', head: true }).eq('status', 'pendente'),
    supabase
      .from('projetos')
      .select('setup_value, monthly_value')
      .not('setup_value', 'is', null)
      .not('monthly_value', 'is', null),
    supabase
      .from('leads')
      .select('id', { count: 'exact', head: true })
      .in('source', ['formulario', 'contato_site', 'email', 'instagram', 'indicacao', 'telefone', 'whatsapp']),
    supabase
      .from('leads')
      .select('id', { count: 'exact', head: true })
      .eq('source', 'prospeccao_gmn'),
  ]);

  const leads: LeadRow[] =
    leadsRes.status === 'fulfilled' ? ((leadsRes.value.data ?? []) as LeadRow[]) : [];
  const recentLeads = leads.filter((l) => new Date(l.created_at) >= thirtyDaysAgo).length;
  const clientes = clientesRes.status === 'fulfilled' ? (clientesRes.value.count ?? 0) : 0;
  const tarefas = tarefasRes.status === 'fulfilled' ? (tarefasRes.value.count ?? 0) : 0;
  const projetos: ProjetoRow[] =
    projetosRes.status === 'fulfilled' ? ((projetosRes.value.data ?? []) as ProjetoRow[]) : [];
  const leadsSite = leadsSiteRes.status === 'fulfilled' ? (leadsSiteRes.value.count ?? 0) : 0;
  const leadsGmn  = leadsGmnRes.status  === 'fulfilled' ? (leadsGmnRes.value.count  ?? 0) : 0;

  // Funil: count por stage (inclui 'perdido')
  const funnelCounts: Record<string, number> = {};
  for (const s of [...STAGE_ORDER, 'perdido']) funnelCounts[s] = 0;
  for (const lead of leads) {
    if (lead.stage && funnelCounts[lead.stage] !== undefined) funnelCounts[lead.stage]++;
  }

  // Taxa de conversão
  const fechados = leads.filter((l) => l.stage === 'fechado').length;
  const taxaConversao =
    leads.length > 0 ? ((fechados / leads.length) * 100).toFixed(1) + '%' : '0.0%';

  // Ticket médio (setup_value + monthly_value por projeto)
  let ticketMedio = '—';
  if (projetos.length > 0) {
    const soma = projetos.reduce(
      (acc, p) => acc + (p.setup_value ?? 0) + (p.monthly_value ?? 0),
      0
    );
    ticketMedio = (soma / projetos.length).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  }

  // Tempo médio entre created_at e ai_qualified_at
  const leadsQualificados = leads.filter((l) => l.ai_qualified_at);
  let tempoMedio = '—';
  if (leadsQualificados.length > 0) {
    const totalMs = leadsQualificados.reduce(
      (acc, l) =>
        acc + (new Date(l.ai_qualified_at!).getTime() - new Date(l.created_at).getTime()),
      0
    );
    tempoMedio = (totalMs / leadsQualificados.length / 86_400_000).toFixed(1) + ' dias';
  }

  // Distribuição de score IA
  const scoreCount = { alto: 0, medio: 0, baixo: 0, sem_score: 0 };
  for (const lead of leads) {
    if (lead.ai_score === 'alto') scoreCount.alto++;
    else if (lead.ai_score === 'medio') scoreCount.medio++;
    else if (lead.ai_score === 'baixo') scoreCount.baixo++;
    else scoreCount.sem_score++;
  }

  return {
    totalLeads: leads.length,
    recentLeads,
    clientes,
    tarefas,
    funnelCounts,
    taxaConversao,
    ticketMedio,
    tempoMedio,
    scoreCount,
    leadsSite,
    leadsGmn,
  };
}

const accentStyles: Record<string, string> = {
  cyan:   'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  blue:   'bg-blue-500/10 text-blue-400 border-blue-500/20',
  purple: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  amber:  'bg-amber-500/10 text-amber-400 border-amber-500/20',
};

const CARD = 'bg-[#0A0A0A] border border-white/10 rounded-2xl p-6';

export default async function AdminDashboardPage() {
  const metrics = await getMetrics();

  const cards = [
    {
      label: 'Total de Leads',
      value: metrics.totalLeads,
      sub: `+${metrics.recentLeads} nos últimos 30 dias`,
      icon: Users,
      accent: 'cyan',
    },
    {
      label: 'Leads este Mês',
      value: metrics.recentLeads,
      sub: 'últimos 30 dias',
      icon: TrendingUp,
      accent: 'blue',
    },
    {
      label: 'Clientes Ativos',
      value: metrics.clientes,
      sub: 'em projetos',
      icon: Building2,
      accent: 'purple',
    },
    {
      label: 'Tarefas Pendentes',
      value: metrics.tarefas,
      sub: 'aguardando ação',
      icon: CheckSquare,
      accent: 'amber',
    },
  ];

  const funnelStages = [...STAGE_ORDER, 'perdido'] as string[];

  const scoreEntries: { key: string; label: string; count: number }[] = [
    { key: 'alto',      label: 'Alto',      count: metrics.scoreCount.alto },
    { key: 'medio',     label: 'Médio',     count: metrics.scoreCount.medio },
    { key: 'baixo',     label: 'Baixo',     count: metrics.scoreCount.baixo },
    { key: 'sem_score', label: 'Sem score', count: metrics.scoreCount.sem_score },
  ];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="font-outfit text-3xl font-black tracking-tight text-white">Dashboard</h1>
        <p className="text-gray-600 text-sm mt-1">Visão geral do negócio</p>
      </div>

      {/* Cards existentes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {cards.map((card) => (
          <div
            key={card.label}
            className={`${CARD} hover:border-white/20 transition-all group`}
          >
            <div className="flex items-start justify-between mb-5">
              <div
                className={`w-10 h-10 rounded-xl border flex items-center justify-center ${accentStyles[card.accent]}`}
              >
                <card.icon className="w-5 h-5" />
              </div>
              <ArrowUpRight className="w-4 h-4 text-gray-800 group-hover:text-gray-500 transition-colors" />
            </div>
            <p className="font-outfit text-4xl font-black text-white tracking-tight">{card.value}</p>
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mt-1">{card.label}</p>
            <p className="text-xs text-gray-700 mt-1">{card.sub}</p>
          </div>
        ))}
      </div>

      {/* Origem dos Leads */}
      <div className="mt-6">
        <h2 className="font-outfit text-lg font-black tracking-tight text-white mb-4">
          Origem dos Leads
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className={`${CARD} hover:border-white/20 transition-all`}>
            <div className="flex items-start justify-between mb-5">
              <div className="w-10 h-10 rounded-xl border flex items-center justify-center bg-blue-500/10 text-blue-400 border-blue-500/20 text-lg">
                🌐
              </div>
            </div>
            <p className="font-outfit text-4xl font-black text-blue-400 tracking-tight">{metrics.leadsSite}</p>
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mt-1">Site Público</p>
            <p className="text-xs text-gray-700 mt-1">formulário, contato, redes sociais, WhatsApp, indicação</p>
          </div>

          <div className={`${CARD} hover:border-white/20 transition-all`}>
            <div className="flex items-start justify-between mb-5">
              <div className="w-10 h-10 rounded-xl border flex items-center justify-center bg-cyan-500/10 text-cyan-400 border-cyan-500/20 text-lg">
                📍
              </div>
            </div>
            <p className="font-outfit text-4xl font-black text-cyan-400 tracking-tight">{metrics.leadsGmn}</p>
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mt-1">Prospecção GMN</p>
            <p className="text-xs text-gray-700 mt-1">leads captados pela landing page de oferta GMN</p>
          </div>
        </div>
      </div>

      {/* Inteligência Comercial */}
      <div className="mt-10">
        <h2 className="font-outfit text-lg font-black tracking-tight text-white mb-4">
          Inteligência Comercial
        </h2>

        {/* 3 métricas em linha */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
          <div className={CARD}>
            <p className="text-[9px] font-black uppercase tracking-widest text-gray-700 mb-3">
              Taxa de Conversão
            </p>
            <p className="font-outfit text-4xl font-black text-white tracking-tight">
              {metrics.taxaConversao}
            </p>
            <p className="text-xs text-gray-700 mt-1">leads fechados ÷ total</p>
          </div>

          <div className={CARD}>
            <p className="text-[9px] font-black uppercase tracking-widest text-gray-700 mb-3">
              Ticket Médio
            </p>
            <p className="font-outfit text-3xl font-black text-white tracking-tight break-all">
              {metrics.ticketMedio}
            </p>
            <p className="text-xs text-gray-700 mt-1">setup + mensalidade por projeto</p>
          </div>

          <div className={CARD}>
            <p className="text-[9px] font-black uppercase tracking-widest text-gray-700 mb-3">
              Tempo Médio para Fechar
            </p>
            <p className="font-outfit text-4xl font-black text-white tracking-tight">
              {metrics.tempoMedio}
            </p>
            <p className="text-xs text-gray-700 mt-1">da entrada até qualificação IA</p>
          </div>
        </div>

        {/* Funil + Score IA */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Funil de Leads */}
          <div className={`lg:col-span-2 ${CARD}`}>
            <p className="text-[9px] font-black uppercase tracking-widest text-gray-700 mb-5">
              Funil de Leads
            </p>
            <div className="space-y-3">
              {funnelStages.map((stage) => {
                const count = metrics.funnelCounts[stage] ?? 0;
                const pct = metrics.totalLeads > 0 ? (count / metrics.totalLeads) * 100 : 0;
                return (
                  <div key={stage}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">
                        {estagioConfig[stage]?.label ?? stage}
                      </span>
                      <span className="text-xs text-gray-400 font-bold tabular-nums">{count}</span>
                    </div>
                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div
                        style={{ width: `${pct}%` }}
                        className="h-full bg-white/25 rounded-full"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Distribuição Score IA */}
          <div className={CARD}>
            <p className="text-[9px] font-black uppercase tracking-widest text-gray-700 mb-5">
              Distribuição Score IA
            </p>
            <div className="space-y-3">
              {scoreEntries.map(({ key, label, count }) => (
                <div key={key} className="flex items-center justify-between">
                  {key === 'sem_score' ? (
                    <span className="inline-flex px-2 py-1 rounded-lg border text-[9px] font-black uppercase tracking-widest bg-white/5 text-gray-600 border-white/10">
                      Sem score
                    </span>
                  ) : (
                    <span
                      className={`inline-flex px-2 py-1 rounded-lg border text-[9px] font-black uppercase tracking-widest ${scoreConfig[key]?.style ?? ''}`}
                    >
                      {label}
                    </span>
                  )}
                  <span className="text-sm text-gray-400 font-bold tabular-nums">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
