export type EstrategiaCobranca = 'somente_setup' | 'somente_recorrencia' | 'setup_mais_recorrencia';

export type Precificacao = {
  id: string;
  lead_id: string;

  setup_base_calculado?: number | null;
  setup_acrescimos?: number | null;
  setup_multiplicador?: number | null;
  setup_valor_final?: number | null;

  leads_mes_estimado?: number | null;
  recorrencia_valor_calculado?: number | null;
  recorrencia_valor_final?: number | null;

  estrategia_cobranca?: EstrategiaCobranca | null;
  observacoes_precificacao?: string | null;

  created_at: string;
  updated_at: string;
};

export const ESTRATEGIA_OPTIONS: { value: EstrategiaCobranca; label: string }[] = [
  { value: 'somente_setup', label: 'Somente Setup' },
  { value: 'somente_recorrencia', label: 'Somente Recorrência' },
  { value: 'setup_mais_recorrencia', label: 'Setup + Recorrência' },
];
