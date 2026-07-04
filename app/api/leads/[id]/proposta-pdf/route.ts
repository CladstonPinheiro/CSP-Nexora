import { NextRequest, NextResponse } from 'next/server';
import { renderToBuffer } from '@react-pdf/renderer';
import { createAdminClient } from '@/lib/supabase';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { PropostaDocument } from '@/lib/pdf/propostaTemplate';

export const runtime = 'nodejs';

function sanitizeFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9À-ÿ\s]/g, '').trim().replace(/\s+/g, '_');
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const authClient = await createSupabaseServerClient();
  const { data: { user } } = await authClient.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
  }

  const { data: papel } = await authClient.rpc('get_papel');
  if (papel !== 'admin' && papel !== 'editor') {
    return NextResponse.json({ error: 'Sem permissão.' }, { status: 403 });
  }

  const supabase = createAdminClient();

  const { data: lead, error: leadError } = await supabase
    .from('leads')
    .select('company_name, contact_name')
    .eq('id', id)
    .single();

  if (leadError || !lead) {
    return NextResponse.json({ error: 'Lead não encontrado.' }, { status: 404 });
  }

  const [{ data: briefing }, { data: precificacao }] = await Promise.all([
    supabase
      .from('briefings')
      .select('perdeu_agendamento_desorganizacao, cliente_sem_registro, perde_cliente_falta_atendimento, sabe_metricas_mes')
      .eq('lead_id', id)
      .maybeSingle(),
    supabase
      .from('precificacoes')
      .select('estrategia_cobranca, setup_valor_final, recorrencia_valor_final, observacoes_precificacao')
      .eq('lead_id', id)
      .maybeSingle(),
  ]);

  if (!briefing || !precificacao) {
    return NextResponse.json(
      { error: 'Preencha o briefing e a precificação antes de gerar a proposta.' },
      { status: 400 }
    );
  }

  if (!precificacao.estrategia_cobranca) {
    return NextResponse.json(
      { error: 'Defina a estratégia de cobrança antes de gerar a proposta.' },
      { status: 400 }
    );
  }

  try {
    const buffer = await renderToBuffer(
      PropostaDocument({ lead, briefing, precificacao })
    );

    const filename = `Proposta_${sanitizeFilename(lead.company_name ?? 'lead')}.pdf`;

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (err) {
    console.error('[leads/proposta-pdf] erro ao gerar PDF:', err);
    return NextResponse.json({ error: 'Erro ao gerar o PDF.' }, { status: 500 });
  }
}
