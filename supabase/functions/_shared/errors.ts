export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
};

export type Situacao =
  | 'AGENDAMENTO_CRIADO'
  | 'AGENDAMENTO_REAGENDADO'
  | 'AGENDAMENTO_CANCELADO'
  | 'HORARIOS_DISPONIVEIS'
  | 'HORARIO_DISPONIVEL'
  | 'HORARIO_OCUPADO'
  | 'AGENDA_FECHADA'
  | 'DATA_PASSADA'
  | 'TOKEN_INVALIDO'
  | 'AGENDAMENTO_NAO_ENCONTRADO'
  | 'LEAD_NAO_ENCONTRADO'
  | 'CAMPO_OBRIGATORIO_AUSENTE'
  | 'FORMATO_INVALIDO'
  | 'AGENDAMENTO_JA_CANCELADO'
  | 'AGENDAMENTO_CANCELADO_NAO_REAGENDAVEL'
  | 'ERRO_INTERNO';

interface RespostaBody {
  sucesso: boolean;
  situacao: Situacao;
  mensagem: string;
  [key: string]: unknown;
}

function jsonResponse(status: number, body: RespostaBody): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

export function respostaErro(
  status: number,
  situacao: Situacao,
  mensagem: string,
  extra: Record<string, unknown> = {}
): Response {
  return jsonResponse(status, { sucesso: false, situacao, mensagem, ...extra });
}

export function respostaSucesso(
  status: number,
  situacao: Situacao,
  mensagem: string,
  extra: Record<string, unknown> = {}
): Response {
  return jsonResponse(status, { sucesso: true, situacao, mensagem, ...extra });
}

export function respostaOptions(): Response {
  return new Response('ok', { headers: corsHeaders });
}
