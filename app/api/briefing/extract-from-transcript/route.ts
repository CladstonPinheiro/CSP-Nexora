import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase-server';

const BRIEFING_FIELDS = [
  'servicos_oferecidos',
  'servicos_melhor_retorno',
  'ticket_medio',
  'atendimentos_por_dia',
  'investe_trafego_pago',
  'contatos_whatsapp_dia',
  'tem_followup',
  'presenca_instagram',
  'perdeu_agendamento_desorganizacao',
  'cliente_sem_registro',
  'perda_financeira_estimada',
  'clientes_inativos_sem_reativacao',
  'perde_cliente_falta_atendimento',
  'sabe_metricas_mes',
  'objecoes_livres',
  'observacoes_gerais',
] as const;

type ExtractedBriefing = Record<(typeof BRIEFING_FIELDS)[number], string>;

function parseGeminiJson(raw: string): unknown {
  const cleaned = raw.trim().replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '');
  return JSON.parse(cleaned);
}

export async function POST(req: NextRequest) {
  const authClient = await createSupabaseServerClient();
  const { data: { user } } = await authClient.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
  }

  const { data: papel } = await authClient.rpc('get_papel');
  if (papel !== 'admin' && papel !== 'editor') {
    return NextResponse.json({ error: 'Sem permissão.' }, { status: 403 });
  }

  const { transcript, lead_id } = await req.json();

  if (!transcript?.trim()) {
    return NextResponse.json({ error: 'transcript é obrigatório.' }, { status: 400 });
  }
  if (!lead_id) {
    return NextResponse.json({ error: 'lead_id é obrigatório.' }, { status: 400 });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('[briefing/extract-from-transcript] GEMINI_API_KEY ausente nas variáveis de ambiente');
    return NextResponse.json({ error: 'GEMINI_API_KEY não configurada.' }, { status: 500 });
  }

  const prompt = `Você é um analista que extrai respostas de briefing comercial a partir de transcrições de reuniões.

Leia a transcrição abaixo e extraia as respostas para os seguintes campos:
- "servicos_oferecidos": quais serviços a empresa oferece
- "servicos_melhor_retorno": quais serviços dão o melhor retorno
- "ticket_medio": qual o ticket médio
- "atendimentos_por_dia": quantos atendimentos por dia, em média
- "investe_trafego_pago": se investe em tráfego pago hoje
- "contatos_whatsapp_dia": quantos contatos recebe no WhatsApp por dia
- "tem_followup": se tem algum processo de follow-up com os clientes
- "presenca_instagram": como é a presença no Instagram
- "perdeu_agendamento_desorganizacao": se já perdeu agendamento por desorganização
- "cliente_sem_registro": se já atendeu cliente que não estava registrado em lugar nenhum
- "perda_financeira_estimada": estimativa de perda financeira relacionada a isso
- "clientes_inativos_sem_reativacao": se tem clientes inativos que nunca foram reativados
- "perde_cliente_falta_atendimento": se já perdeu cliente por falta de atendimento rápido
- "sabe_metricas_mes": se sabe dizer as métricas do negócio no último mês
- "objecoes_livres": outras objeções levantadas pelo lead
- "observacoes_gerais": observações gerais sobre a reunião

REGRAS:
- Se a informação não estiver clara ou não foi mencionada na transcrição, retorne string vazia para aquele campo. Não invente respostas.
- Respostas em português, resumidas, na forma como o lead descreveu.

Retorne APENAS um objeto JSON válido, sem texto adicional, markdown ou blocos de código, com exatamente estes 16 campos, todos string:
{
  "servicos_oferecidos": "",
  "servicos_melhor_retorno": "",
  "ticket_medio": "",
  "atendimentos_por_dia": "",
  "investe_trafego_pago": "",
  "contatos_whatsapp_dia": "",
  "tem_followup": "",
  "presenca_instagram": "",
  "perdeu_agendamento_desorganizacao": "",
  "cliente_sem_registro": "",
  "perda_financeira_estimada": "",
  "clientes_inativos_sem_reativacao": "",
  "perde_cliente_falta_atendimento": "",
  "sabe_metricas_mes": "",
  "objecoes_livres": "",
  "observacoes_gerais": ""
}

TRANSCRIÇÃO DA REUNIÃO:
${transcript}`;

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: 'application/json', temperature: 0.1 },
        }),
      }
    );

    if (!res.ok) {
      const errBody = await res.text();
      console.error('[briefing/extract-from-transcript] Gemini HTTP error:', res.status, errBody);
      return NextResponse.json({ error: 'Erro ao chamar Gemini.' }, { status: 500 });
    }

    const geminiData = await res.json();
    const raw = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';

    let parsed: Partial<ExtractedBriefing>;
    try {
      parsed = parseGeminiJson(raw) as Partial<ExtractedBriefing>;
    } catch {
      console.error('[briefing/extract-from-transcript] falha ao parsear JSON:', raw.slice(0, 300));
      return NextResponse.json({ error: 'Resposta inválida do Gemini.' }, { status: 500 });
    }

    const data = Object.fromEntries(
      BRIEFING_FIELDS.map((field) => [field, typeof parsed[field] === 'string' ? parsed[field] : ''])
    ) as ExtractedBriefing;

    return NextResponse.json({ data });
  } catch (err) {
    console.error('[briefing/extract-from-transcript] erro inesperado:', err);
    return NextResponse.json({ error: 'Erro interno.' }, { status: 500 });
  }
}
