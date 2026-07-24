export type LeadProspeccaoStatus = 'novo' | 'contatado' | 'agendado' | 'migrado' | 'descartado';

export type LeadProspeccao = {
  id: string;
  title: string;
  phone: string | null;
  address: string | null;
  website: string | null;
  category_name: string | null;
  total_score: number | null;
  reviews_count: number | null;
  maps_url: string | null;
  search_term: string | null;
  status: LeadProspeccaoStatus;
  instagram_url: string | null;
  created_at: string;
};

export const STATUS_ORDER: LeadProspeccaoStatus[] = [
  'novo',
  'contatado',
  'agendado',
  'migrado',
  'descartado',
];

export const statusConfig: Record<LeadProspeccaoStatus, { label: string; style: string; chartColor: string }> = {
  novo:       { label: 'Novo',       style: 'bg-blue-500/15 text-blue-400 border-blue-500/20',       chartColor: '#60a5fa' },
  contatado:  { label: 'Contatado',  style: 'bg-amber-500/15 text-amber-400 border-amber-500/20',     chartColor: '#fbbf24' },
  agendado:   { label: 'Agendado',   style: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/20',        chartColor: '#22d3ee' },
  migrado:    { label: 'Migrado',    style: 'bg-green-500/15 text-green-400 border-green-500/20',     chartColor: '#4ade80' },
  descartado: { label: 'Descartado', style: 'bg-red-500/15 text-red-400 border-red-500/20',           chartColor: '#f87171' },
};
