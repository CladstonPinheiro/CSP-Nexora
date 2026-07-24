export type BriefingStatus = 'em_andamento' | 'aguardando_revisao_ia' | 'concluido';

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

  descricao_empresa?: string | null;
  servicos_maior_faturamento?: string | null;
  numero_colaboradores?: string | null;
  clientes_atendidos_mes?: string | null;
  objetivo_12_meses?: string | null;

  canais_captacao?: string | null;
  percentual_captacao_organica?: string | null;
  possui_site?: string | null;

  responsavel_whatsapp?: string | null;
  tem_atendente_dedicado?: string | null;
  tempo_medio_resposta?: string | null;
  atendimento_fora_horario?: string | null;

  organizacao_leads_atual?: string | null;
  utiliza_crm?: string | null;
  acompanhamento_funil?: string | null;
  acompanhamento_leads_nao_convertidos?: string | null;

  processo_agendamento?: string | null;
  agendamento_manual?: string | null;
  possui_lembretes_automaticos?: string | null;

  controle_pagamentos?: string | null;
  existe_inadimplencia?: string | null;
  processo_cobranca?: string | null;
  utiliza_erp?: string | null;

  indicadores_acompanhados?: string | null;
  mede_conversao?: string | null;
  canal_mais_efetivo?: string | null;
  sabe_cac?: string | null;

  maior_consumidor_tempo?: string | null;
  maior_gerador_retrabalho?: string | null;
  onde_perde_dinheiro?: string | null;
  processo_prioritario_automatizar?: string | null;

  visao_2_anos?: string | null;
  passos_necessarios?: string | null;
  obstaculos_crescimento?: string | null;

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
    title: 'Empresa',
    fields: [
      { key: 'descricao_empresa', label: 'Fale sobre a empresa (o que faz, há quanto tempo atua)' },
      { key: 'servicos_oferecidos', label: 'Quais serviços a empresa oferece?' },
      { key: 'servicos_melhor_retorno', label: 'Quais serviços dão o melhor retorno?' },
      { key: 'servicos_maior_faturamento', label: 'Quais serviços representam a maior parte do faturamento?' },
      { key: 'numero_colaboradores', label: 'Quantos colaboradores trabalham na empresa?' },
      { key: 'ticket_medio', label: 'Qual o ticket médio?' },
      { key: 'atendimentos_por_dia', label: 'Quantos atendimentos por dia, em média?' },
      { key: 'clientes_atendidos_mes', label: 'Quantos clientes distintos são atendidos por mês?' },
      { key: 'objetivo_12_meses', label: 'Qual o objetivo da empresa para os próximos 12 meses?' },
    ],
  },
  {
    title: 'Captação',
    fields: [
      { key: 'canais_captacao', label: 'Como os clientes chegam até a empresa?' },
      { key: 'investe_trafego_pago', label: 'Investe em tráfego pago hoje?' },
      { key: 'percentual_captacao_organica', label: 'Quanto da captação é orgânica?' },
      { key: 'contatos_whatsapp_dia', label: 'Quantos contatos recebe no WhatsApp por dia?' },
      { key: 'presenca_instagram', label: 'Como é a presença no Instagram?' },
      { key: 'possui_site', label: 'Possui site próprio?' },
    ],
  },
  {
    title: 'Atendimento',
    fields: [
      { key: 'responsavel_whatsapp', label: 'Quem responde o WhatsApp hoje?' },
      { key: 'tem_atendente_dedicado', label: 'Existe alguém dedicado exclusivamente ao atendimento?' },
      { key: 'tempo_medio_resposta', label: 'Qual o tempo médio para responder um novo contato?' },
      { key: 'atendimento_fora_horario', label: 'O atendimento acontece fora do horário comercial?' },
      { key: 'perde_cliente_falta_atendimento', label: 'Já perdeu cliente por falta de atendimento rápido?' },
    ],
  },
  {
    title: 'CRM',
    fields: [
      { key: 'organizacao_leads_atual', label: 'Como os leads são organizados hoje?' },
      { key: 'utiliza_crm', label: 'Utiliza algum CRM hoje? Qual?' },
      { key: 'acompanhamento_funil', label: 'Como acompanham o funil de vendas?' },
      { key: 'sabe_metricas_mes', label: 'Sabe dizer as métricas do negócio no último mês?' },
      { key: 'acompanhamento_leads_nao_convertidos', label: 'Como fazem o acompanhamento de clientes que ainda não compraram?' },
      { key: 'cliente_sem_registro', label: 'Já atendeu cliente que não estava registrado em lugar nenhum?' },
      { key: 'tem_followup', label: 'Tem algum processo de follow-up com os clientes?' },
    ],
  },
  {
    title: 'Agenda',
    fields: [
      { key: 'processo_agendamento', label: 'Como funciona o processo de agendamento hoje?' },
      { key: 'agendamento_manual', label: 'O agendamento é feito manualmente?' },
      { key: 'perdeu_agendamento_desorganizacao', label: 'Já perdeu agendamento por desorganização?' },
      { key: 'possui_lembretes_automaticos', label: 'Existem lembretes automáticos de agendamento?' },
    ],
  },
  {
    title: 'Financeiro',
    fields: [
      { key: 'controle_pagamentos', label: 'Como controlam pagamentos?' },
      { key: 'existe_inadimplencia', label: 'Existe inadimplência?' },
      { key: 'processo_cobranca', label: 'Como fazem cobranças?' },
      { key: 'utiliza_erp', label: 'Utiliza algum ERP hoje? Qual?' },
    ],
  },
  {
    title: 'Indicadores',
    fields: [
      { key: 'indicadores_acompanhados', label: 'Quais indicadores de negócio acompanham?' },
      { key: 'mede_conversao', label: 'Conseguem medir a taxa de conversão?' },
      { key: 'canal_mais_efetivo', label: 'Sabem qual canal gera mais clientes?' },
      { key: 'sabe_cac', label: 'Sabem quanto custa adquirir um novo cliente (CAC)?' },
    ],
  },
  {
    title: 'Dores',
    fields: [
      { key: 'maior_consumidor_tempo', label: 'O que mais toma tempo da equipe hoje?' },
      { key: 'maior_gerador_retrabalho', label: 'O que mais gera retrabalho?' },
      { key: 'onde_perde_dinheiro', label: 'Onde sentem que perdem dinheiro no processo atual?' },
      { key: 'perda_financeira_estimada', label: 'Consegue estimar uma perda financeira relacionada a isso?' },
      { key: 'processo_prioritario_automatizar', label: 'Qual processo automatizariam primeiro?' },
      { key: 'clientes_inativos_sem_reativacao', label: 'Tem clientes inativos que nunca foram reativados?' },
    ],
  },
  {
    title: 'Futuro',
    fields: [
      { key: 'visao_2_anos', label: 'Como imaginam a empresa daqui a 2 anos?' },
      { key: 'passos_necessarios', label: 'O que precisa acontecer para chegarem lá?' },
      { key: 'obstaculos_crescimento', label: 'O que impede esse crescimento hoje?' },
    ],
  },
  {
    title: 'Observações',
    fields: [
      { key: 'objecoes_livres', label: 'Outras objeções levantadas pelo lead' },
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
