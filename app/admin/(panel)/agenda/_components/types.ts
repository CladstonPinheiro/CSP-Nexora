export type AgendamentoStatus = 'agendado' | 'confirmado' | 'realizado' | 'faltou' | 'cancelado';

export type AgendamentoLead = {
  company_name: string | null;
  contact_name: string | null;
  phone: string | null;
};

export type Agendamento = {
  id: string;
  lead_id: string;
  assunto: string | null;
  data_hora_inicio: string;
  data_hora_fim: string;
  status: AgendamentoStatus;
  leads: AgendamentoLead | null;
};

export type StatusGrupo = 'ativos' | 'concluidos' | 'cancelados';

export function statusGrupoDe(status: AgendamentoStatus): StatusGrupo {
  if (status === 'cancelado') return 'cancelados';
  if (status === 'realizado' || status === 'faltou') return 'concluidos';
  return 'ativos';
}

export const statusConfig: Record<AgendamentoStatus, { label: string; style: string }> = {
  agendado:   { label: 'Agendado',   style: 'bg-blue-500/15 text-blue-400 border-blue-500/20' },
  confirmado: { label: 'Confirmado', style: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/20' },
  realizado:  { label: 'Realizado',  style: 'bg-green-500/15 text-green-400 border-green-500/20' },
  faltou:     { label: 'Faltou',     style: 'bg-orange-500/15 text-orange-400 border-orange-500/20' },
  cancelado:  { label: 'Cancelado',  style: 'bg-red-500/15 text-red-400 border-red-500/20' },
};

export const statusGrupoConfig: Record<StatusGrupo, { label: string }> = {
  ativos:     { label: 'Ativos' },
  concluidos: { label: 'Concluídos' },
  cancelados: { label: 'Cancelados' },
};

export type LeadOption = {
  id: string;
  company_name: string | null;
  contact_name: string | null;
  phone: string | null;
};
