import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { nome, email, empresa, telefone } = await req.json();

    if (!nome || !email || !empresa || !telefone) {
      return NextResponse.json(
        { error: 'Todos os campos são obrigatórios (nome, email, empresa, telefone).' },
        { status: 400 }
      );
    }

    let supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.error('Supabase credentials missing.');
      return NextResponse.json(
        { 
          error: 'Credenciais do Supabase não configuradas no servidor.',
          helper: 'Por favor, adicione as variáveis de ambiente SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY.'
        },
        { status: 512 }
      );
    }

    // Limpa a URL caso o usuário tenha colado o endpoint completo com "/rest/v1" ou barras extras no final
    supabaseUrl = supabaseUrl.trim();
    supabaseUrl = supabaseUrl.replace(/\/rest\/v1\/?$/, ''); // Remove /rest/v1 ou /rest/v1/
    supabaseUrl = supabaseUrl.replace(/\/+$/, ''); // Remove barras no final

    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
      },
    });

    // We will save to a 'leads' table
    const { data, error } = await supabase
      .from('leads')
      .insert([
        { 
          nome, 
          email, 
          empresa, 
          telefone,
          created_at: new Date().toISOString()
        }
      ])
      .select();

    if (error) {
      console.error('Error inserting lead to Supabase:', error);
      return NextResponse.json(
        { 
          error: 'Erro ao salvar no banco de dados Supabase.',
          details: error.message,
          code: error.code
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    console.error('Internal API error:', err);
    return NextResponse.json(
      { error: 'Erro interno no servidor.', details: err.message },
      { status: 500 }
    );
  }
}
