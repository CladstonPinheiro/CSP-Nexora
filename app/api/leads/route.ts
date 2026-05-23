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

    let supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ypuwizzaokddsllegmjl.supabase.co';
    let supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ || process.env.SUPABASE_KEY;

    // Se a chave ainda não foi encontrada, buscar dinamicamente qualquer variável de ambiente do Supabase que pareça uma chave secreta
    if (!supabaseKey) {
      const foundKeyName = Object.keys(process.env).find(k => 
        k.startsWith('SUPABASE') && 
        !k.includes('URL') && 
        (k.includes('KEY') || k.includes('SERVICE') || k.includes('SECRET') || k.endsWith('_'))
      );
      if (foundKeyName) {
        supabaseKey = process.env[foundKeyName];
        console.log(`Chave dinâmica do Supabase autodetectada a partir de: ${foundKeyName}`);
      }
    }

    if (!supabaseUrl || !supabaseKey) {
      const existingSupabaseEnvKeys = Object.keys(process.env).filter(k => k.includes('SUPABASE'));
      console.error('Supabase credentials missing. Available Supabase env keys:', existingSupabaseEnvKeys);
      return NextResponse.json(
        { 
          error: 'Credenciais do Supabase não configuradas no servidor.',
          helper: 'Por favor, certifique-se de que adicionou as variáveis do Supabase no painel de Segredos (Secrets) do AI Studio.',
          debugKeysFound: existingSupabaseEnvKeys
        },
        { status: 512 }
      );
    }

    // Limpa e cura a URL caso o usuário tenha colado incompletamente (por exemplo, cortado no final) ou com caminhos extras
    supabaseUrl = supabaseUrl.trim();
    if (supabaseUrl.includes('ypuwizzaokddsllegmj')) {
      supabaseUrl = 'https://ypuwizzaokddsllegmjl.supabase.co';
    }
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
