import { createAdminClient } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { nome, email, empresa, telefone } = await req.json();

    if (!nome || !email || !empresa || !telefone) {
      return NextResponse.json(
        { error: 'Todos os campos são obrigatórios.' },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from('leads')
      .insert([{
        contact_name: nome,
        company_name: empresa,
        phone:        telefone,
        email,
        source:       'formulario',
        stage:        'identificado',
        created_at:   new Date().toISOString(),
      }])
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: 'Erro de banco de dados.', details: error.message, code: error.code },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erro desconhecido';
    return NextResponse.json(
      { error: 'Erro interno no servidor.', details: message },
      { status: 500 }
    );
  }
}
