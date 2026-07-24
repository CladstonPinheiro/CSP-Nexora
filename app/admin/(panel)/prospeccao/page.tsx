import { createAdminClient } from '@/lib/supabase';
import { MapPin, Users, PhoneCall, TrendingUp, Instagram, ArrowUpRight } from 'lucide-react';
import { Filters } from './_components/Filters';
import { StatusChart } from './_components/StatusChart';
import { TimelineChart } from './_components/TimelineChart';
import { RetrabalhoTable } from './_components/RetrabalhoTable';
import { STATUS_ORDER, statusConfig, type LeadProspeccao, type LeadProspeccaoStatus } from './_components/types';

const CARD = 'bg-surface border border-border rounded-2xl p-6';
const DEFAULT_DIAS_PARADO = 7;

async function getSearchTerms(): Promise<string[]> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from('leads_prospeccao')
    .select('search_term')
    .not('search_term', 'is', null);
  const unique = new Set((data ?? []).map((r) => r.search_term as string));
  return [...unique].sort();
}

async function getLeads(filters: { status?: string; search_term?: string }): Promise<LeadProspeccao[]> {
  const supabase = createAdminClient();
  let query = supabase
    .from('leads_prospeccao')
    .select('id, title, phone, address, website, category_name, total_score, reviews_count, maps_url, search_term, status, instagram_url, created_at')
    .order('created_at', { ascending: false });

  if (filters.status) query = query.eq('status', filters.status);
  if (filters.search_term) query = query.eq('search_term', filters.search_term);

  const { data } = await query;
  return (data ?? []) as LeadProspeccao[];
}

function buildTimeline(leads: LeadProspeccao[]) {
  const counts = new Map<string, number>();
  for (const lead of leads) {
    const day = lead.created_at.slice(0, 10);
    counts.set(day, (counts.get(day) ?? 0) + 1);
  }
  return [...counts.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, count]) => ({
      date: new Date(date + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
      count,
    }));
}

export default async function ProspeccaoPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; search_term?: string; diasParado?: string }>;
}) {
  const params = await searchParams;
  const diasLimite = Number(params.diasParado) > 0 ? Number(params.diasParado) : DEFAULT_DIAS_PARADO;

  const [leads, searchTerms] = await Promise.all([
    getLeads({ status: params.status, search_term: params.search_term }),
    getSearchTerms(),
  ]);

  const total = leads.length;

  const statusCounts = STATUS_ORDER.reduce((acc, status) => {
    acc[status] = leads.filter((l) => l.status === status).length;
    return acc;
  }, {} as Record<LeadProspeccaoStatus, number>);

  const convertidos = statusCounts.agendado + statusCounts.migrado;
  const taxaConversao = total > 0 ? ((convertidos / total) * 100).toFixed(1) + '%' : '0.0%';

  const comInstagram = leads.filter((l) => l.instagram_url).length;

  const timeline = buildTimeline(leads);

  const summaryCards = [
    { label: 'Total de Leads', value: total, icon: Users, accent: 'cyan' as const },
    { label: 'Taxa de Conversão', value: taxaConversao, icon: TrendingUp, accent: 'blue' as const, sub: 'agendado + migrado / total' },
    { label: 'Com Instagram', value: comInstagram, icon: Instagram, accent: 'purple' as const },
    { label: 'Retrabalho', value: leads.filter((l) => l.status === 'contatado').length, icon: PhoneCall, accent: 'amber' as const, sub: 'contatados no total' },
  ];

  const accentStyles: Record<string, string> = {
    cyan:   'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
    blue:   'bg-blue-500/10 text-blue-400 border-blue-500/20',
    purple: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    amber:  'bg-amber-500/10 text-amber-400 border-amber-500/20',
  };

  return (
    <div className="p-8">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
          <MapPin className="w-4 h-4 text-cyan-400" />
        </div>
        <h1 className="font-outfit text-3xl font-black tracking-tight text-primary">Prospecção Maps</h1>
      </div>
      <p className="text-muted text-sm mt-1 ml-12 mb-6">Leads capturados via Google Maps Scraper</p>

      <Filters searchTerms={searchTerms} />

      {/* Cards de resumo */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        {summaryCards.map((card) => (
          <div key={card.label} className={`${CARD} hover:border-border-strong transition-all group`}>
            <div className="flex items-start justify-between mb-5">
              <div className={`w-10 h-10 rounded-xl border flex items-center justify-center ${accentStyles[card.accent]}`}>
                <card.icon className="w-5 h-5" />
              </div>
              <ArrowUpRight className="w-4 h-4 text-gray-800 group-hover:text-muted transition-colors" />
            </div>
            <p className="font-outfit text-4xl font-black text-primary tracking-tight">{card.value}</p>
            <p className="text-[10px] font-black uppercase tracking-widest text-muted mt-1">{card.label}</p>
            {card.sub && <p className="text-xs text-muted mt-1">{card.sub}</p>}
          </div>
        ))}
      </div>

      {/* Status breakdown badges */}
      <div className="flex flex-wrap gap-2 mb-6">
        {STATUS_ORDER.map((status) => (
          <span
            key={status}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[10px] font-black uppercase tracking-widest ${statusConfig[status].style}`}
          >
            {statusConfig[status].label}
            <span className="tabular-nums">{statusCounts[status]}</span>
          </span>
        ))}
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <div className={CARD}>
          <p className="text-[9px] font-black uppercase tracking-widest text-muted mb-3">Distribuição por Status</p>
          <StatusChart counts={statusCounts} />
        </div>
        <div className={CARD}>
          <p className="text-[9px] font-black uppercase tracking-widest text-muted mb-3">Leads Capturados por Dia</p>
          <TimelineChart data={timeline} />
        </div>
      </div>

      {/* Lista de leads com badge de Instagram */}
      <div className={`${CARD} mb-6 overflow-hidden !p-0`}>
        <div className="px-6 py-4 border-b border-border">
          <p className="text-[9px] font-black uppercase tracking-widest text-muted">Leads ({total})</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead>
              <tr className="border-b border-border bg-white/[0.015]">
                {['Título', 'Telefone', 'Termo de Busca', 'Status', 'Avaliações'].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-[9px] font-black uppercase tracking-widest text-muted">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {leads.map((lead) => (
                <tr key={lead.id} className="border-b border-border last:border-0">
                  <td className="px-5 py-3.5 text-sm font-bold text-primary">
                    <div className="flex items-center gap-2">
                      {lead.title}
                      {lead.instagram_url && (
                        <a
                          href={lead.instagram_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Tem Instagram"
                          className="shrink-0 w-5 h-5 rounded-md bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-400"
                        >
                          <Instagram className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-sm text-secondary">{lead.phone || '—'}</td>
                  <td className="px-5 py-3.5 text-sm text-muted">{lead.search_term || '—'}</td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex px-2 py-1 rounded-lg border text-[9px] font-black uppercase tracking-widest ${statusConfig[lead.status].style}`}>
                      {statusConfig[lead.status].label}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-sm text-muted">{lead.reviews_count ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Retrabalho */}
      <RetrabalhoTable leads={leads} diasLimite={diasLimite} />
    </div>
  );
}
