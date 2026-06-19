export type Estagio =
  | 'identificado'
  | 'briefing_agendado'
  | 'briefing_realizado'
  | 'proposta_enviada'
  | 'em_retorno'
  | 'fechado'
  | 'perdido';

export type Origem =
  | 'whatsapp'
  | 'formulario'
  | 'email'
  | 'instagram'
  | 'indicacao'
  | 'telefone'
  | 'prospeccao_ia';

export type Score = 'alto' | 'medio' | 'baixo';

export type Lead = {
  id: string;
  empresa?: string;
  nome?: string;
  nicho?: string;
  cidade?: string;
  telefone?: string;
  email?: string;
  linkedin?: string;
  instagram?: string;
  website?: string;
  origem?: Origem;
  indicado_por?: string;
  score?: Score;
  anotacoes?: string;
  estagio?: Estagio;
  created_at: string;
};

export const STAGE_ORDER: Estagio[] = [
  'identificado',
  'briefing_agendado',
  'briefing_realizado',
  'proposta_enviada',
  'em_retorno',
  'fechado',
];

export const estagioConfig: Record<string, { label: string; style: string }> = {
  identificado:       { label: 'Identificado',       style: 'bg-gray-500/15 text-gray-400 border-gray-500/20' },
  briefing_agendado:  { label: 'Briefing Agendado',  style: 'bg-blue-500/15 text-blue-400 border-blue-500/20' },
  briefing_realizado: { label: 'Briefing Realizado', style: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/20' },
  proposta_enviada:   { label: 'Proposta Enviada',   style: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/20' },
  em_retorno:         { label: 'Em Retorno',          style: 'bg-orange-500/15 text-orange-400 border-orange-500/20' },
  fechado:            { label: 'Fechado',             style: 'bg-green-500/15 text-green-400 border-green-500/20' },
  perdido:            { label: 'Perdido',             style: 'bg-red-500/15 text-red-400 border-red-500/20' },
};

export const origemConfig: Record<string, { label: string; style: string }> = {
  whatsapp:       { label: 'WhatsApp',       style: 'bg-green-500/15 text-green-400 border-green-500/20' },
  formulario:     { label: 'Formulário',     style: 'bg-blue-500/15 text-blue-400 border-blue-500/20' },
  email:          { label: 'Email',          style: 'bg-orange-500/15 text-orange-400 border-orange-500/20' },
  instagram:      { label: 'Instagram',      style: 'bg-pink-500/15 text-pink-400 border-pink-500/20' },
  indicacao:      { label: 'Indicação',      style: 'bg-purple-500/15 text-purple-400 border-purple-500/20' },
  telefone:       { label: 'Telefone',       style: 'bg-gray-500/15 text-gray-400 border-gray-500/20' },
  prospeccao_ia:  { label: 'Prospecção IA',  style: 'bg-emerald-900/40 text-emerald-400 border-emerald-700/30' },
};

export const nichoLabel: Record<string, string> = {
  imobiliaria:                'Imobiliária',
  administradora_imoveis:     'Adm. de Imóveis',
  administradora_condominios: 'Adm. de Condomínios',
  outro:                      'Outro',
};

export const scoreConfig: Record<string, { label: string; style: string }> = {
  alto:  { label: 'Alto',  style: 'bg-green-500/15 text-green-400 border-green-500/20' },
  medio: { label: 'Médio', style: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/20' },
  baixo: { label: 'Baixo', style: 'bg-red-500/15 text-red-400 border-red-500/20' },
};
