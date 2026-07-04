export type BriefingStatus = 'em_andamento' | 'concluido';

export type IntegracaoDesejada =
  | 'crm'
  | 'pagamento'
  | 'hotmart_kiwify'
  | 'api_propria_erp'
  | 'sistema_medico'
  | 'outra';

export type Briefing = {
  id: string;
  lead_id: string;

  servicos_oferecidos?: string | null;
  servicos_melhor_retorno?: string | null;
  ticket_medio?: string | null;
  atendimentos_por_dia?: string | null;
  investe_trafego_pago?: string | null;
  contatos_whatsapp_dia?: string | null;
  tem_followup?: string | null;
  presenca_instagram?: string | null;

  perdeu_agendamento_desorganizacao?: string | null;
  cliente_sem_registro?: string | null;
  perda_financeira_estimada?: string | null;
  clientes_inativos_sem_reativacao?: string | null;
  perde_cliente_falta_atendimento?: string | null;
  sabe_metricas_mes?: string | null;

  objecoes_livres?: string | null;
  observacoes_gerais?: string | null;

  numero_agendas?: number | null;
  numero_fluxos_automacao?: number | null;
  integracoes_desejadas?: IntegracaoDesejada[] | null;

  status: BriefingStatus;
  created_at: string;
  updated_at: string;
};

export type BriefingField = Exclude<
  keyof Briefing,
  'id' | 'lead_id' | 'status' | 'created_at' | 'updated_at' | 'numero_agendas' | 'numero_fluxos_automacao' | 'integracoes_desejadas'
>;

export const BRIEFING_SECTIONS: { title: string; fields: { key: BriefingField; label: string }[] }[] = [
  {
    title: 'Sobre o Negócio',
    fields: [
      { key: 'servicos_oferecidos', label: 'Quais serviços a empresa oferece?' },
      { key: 'servicos_melhor_retorno', label: 'Quais serviços dão o melhor retorno?' },
      { key: 'ticket_medio', label: 'Qual o ticket médio?' },
      { key: 'atendimentos_por_dia', label: 'Quantos atendimentos por dia, em média?' },
      { key: 'investe_trafego_pago', label: 'Investe em tráfego pago hoje?' },
      { key: 'contatos_whatsapp_dia', label: 'Quantos contatos recebe no WhatsApp por dia?' },
      { key: 'tem_followup', label: 'Tem algum processo de follow-up com os clientes?' },
      { key: 'presenca_instagram', label: 'Como é a presença no Instagram?' },
    ],
  },
  {
    title: 'Dores e Objeções',
    fields: [
      { key: 'perdeu_agendamento_desorganizacao', label: 'Já perdeu agendamento por desorganização?' },
      { key: 'cliente_sem_registro', label: 'Já atendeu cliente que não estava registrado em lugar nenhum?' },
      { key: 'perda_financeira_estimada', label: 'Consegue estimar uma perda financeira relacionada a isso?' },
      { key: 'clientes_inativos_sem_reativacao', label: 'Tem clientes inativos que nunca foram reativados?' },
      { key: 'perde_cliente_falta_atendimento', label: 'Já perdeu cliente por falta de atendimento rápido?' },
      { key: 'sabe_metricas_mes', label: 'Sabe dizer as métricas do negócio no último mês?' },
      { key: 'objecoes_livres', label: 'Outras objeções levantadas pelo lead' },
    ],
  },
  {
    title: 'Observações',
    fields: [
      { key: 'observacoes_gerais', label: 'Observações gerais sobre a reunião' },
    ],
  },
];

export const INTEGRACAO_OPTIONS: { value: IntegracaoDesejada; label: string }[] = [
  { value: 'crm', label: 'CRM (Kommo, HubSpot, RD Station)' },
  { value: 'pagamento', label: 'Gateway de pagamento' },
  { value: 'hotmart_kiwify', label: 'Hotmart/Kiwify/Eduzz' },
  { value: 'api_propria_erp', label: 'API própria ou ERP' },
  { value: 'sistema_medico', label: 'Sistema médico/odontológico' },
  { value: 'outra', label: 'Outra integração' },
];
