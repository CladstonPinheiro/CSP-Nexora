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
  nome_contato: string | null;
  cargo_contato: string | null;
  nome_responsavel: string | null;
  cargo_responsavel: string | null;
  status_cadencia: string | null;
  data_msg_1: string | null;
  data_msg_2: string | null;
  data_msg_3: string | null;
  data_msg_4: string | null;
  data_msg_5: string | null;
  motivo_descarte: string | null;
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

const CADENCIA_SEM_ABORDAGEM = { label: 'Ainda não abordado', style: 'bg-white/5 text-muted border-border' };

export const cadenciaConfig: Record<string, { label: string; style: string }> = {
  novo:                  { label: 'Novo',              style: 'bg-gray-500/15 text-gray-400 border-gray-500/20' },
  'Abordado':            { label: 'Abordado',          style: 'bg-blue-500/15 text-blue-400 border-blue-500/20' },
  'Respondeu':           { label: 'Respondeu',         style: 'bg-amber-500/15 text-amber-400 border-amber-500/20' },
  'Em conversa':         { label: 'Em conversa',       style: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/20' },
  'Reunião marcada':     { label: 'Reunião marcada',   style: 'bg-purple-500/15 text-purple-400 border-purple-500/20' },
  'Reunião realizada':   { label: 'Reunião realizada', style: 'bg-teal-500/15 text-teal-400 border-teal-500/20' },
  'Cliente':             { label: 'Cliente',           style: 'bg-green-500/15 text-green-400 border-green-500/20' },
  'Descartado':          { label: 'Descartado',        style: 'bg-red-500/15 text-red-400 border-red-500/20' },
};

export function getCadenciaConfig(status: string | null): { label: string; style: string } {
  if (!status) return CADENCIA_SEM_ABORDAGEM;
  return cadenciaConfig[status] ?? CADENCIA_SEM_ABORDAGEM;
}
