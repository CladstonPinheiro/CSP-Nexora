import { createAdminClient } from '@/lib/supabase';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  const authClient = await createSupabaseServerClient();
  const { data: { user } } = await authClient.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
  }

  try {
    const supabase = createAdminClient();

    const { data: lead, error: fetchError } = await supabase
      .from('leads')
      .select('id, company_name, contact_name, phone, email')
      .eq('id', id)
      .single();

    if (fetchError || !lead) {
      return NextResponse.json(
        { error: 'Lead não encontrado.', details: fetchError?.message },
        { status: 404 }
      );
    }

    const { error: updateError } = await supabase
      .from('leads')
      .update({ stage: 'fechado' })
      .eq('id', id);

    if (updateError) {
      return NextResponse.json(
        { error: 'Erro ao atualizar estágio.', details: updateError.message },
        { status: 500 }
      );
    }

    if (!lead.company_name || lead.company_name.trim() === '') {
      return NextResponse.json({
        success: true,
        clienteCriado: false,
        motivo: 'empresa_nao_preenchida',
      });
    }

    const { data: existing, error: existsError } = await supabase
      .from('clientes')
      .select('id')
      .eq('lead_id', id)
      .maybeSingle();

    if (existsError) {
      return NextResponse.json(
        { error: 'Erro ao verificar cliente existente.', details: existsError.message },
        { status: 500 }
      );
    }

    if (existing) {
      return NextResponse.json({
        success: true,
        clienteCriado: false,
        motivo: 'ja_convertido',
        clienteId: existing.id,
      });
    }

    try {
      const { data: newCliente, error: insertError } = await supabase
        .from('clientes')
        .insert([{
          company_name:  lead.company_name,
          contact_name:  lead.contact_name ?? null,
          phone:         lead.phone ?? null,
          email:         lead.email ?? null,
          lead_id:       id,
        }])
        .select('id')
        .single();

      if (insertError) {
        if (insertError.code === '23505') {
          const { data: race } = await supabase
            .from('clientes')
            .select('id')
            .eq('lead_id', id)
            .maybeSingle();

          return NextResponse.json({
            success: true,
            clienteCriado: false,
            motivo: 'ja_convertido',
            clienteId: race?.id ?? null,
          });
        }

        return NextResponse.json(
          { error: 'Erro ao criar cliente.', details: insertError.message, code: insertError.code },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        clienteCriado: true,
        clienteId: newCliente.id,
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro desconhecido';
      return NextResponse.json(
        { error: 'Erro interno ao criar cliente.', details: message },
        { status: 500 }
      );
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erro desconhecido';
    return NextResponse.json(
      { error: 'Erro interno no servidor.', details: message },
      { status: 500 }
    );
  }
}
