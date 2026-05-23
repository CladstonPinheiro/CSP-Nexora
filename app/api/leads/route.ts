import { createClient } from '@supabase/supabase-js';
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

    // Capture URL from any potential variation of the user's keys
    let supabaseUrl = 
      process.env.URL_SUPABASE || 
      process.env.SUPABASE_URL || 
      process.env.NEXT_PUBLIC_SUPABASE_URL;

    // Capture Key from any potential variation of the user's keys
    let supabaseKey = 
      process.env.SUPABASE_SERVICE_ROLE_KEY || 
      process.env.SUPABASE_SERVICE_ || 
      process.env.SUPABASE_ANON_KEY || 
      process.env.SUPABASE_KEY;

    // Smart-lookup in process.env if standard names are not found
    if (!supabaseUrl) {
      const foundUrlKey = Object.keys(process.env).find(k => 
        k.toUpperCase().includes('SUPABASE') && k.toUpperCase().includes('URL')
      );
      if (foundUrlKey) {
        supabaseUrl = process.env[foundUrlKey];
      }
    }

    if (!supabaseKey) {
      const foundKey = Object.keys(process.env).find(k => 
        k.toUpperCase().includes('SUPABASE') && 
        (k.toUpperCase().includes('KEY') || k.toUpperCase().includes('SERVICE') || k.toUpperCase().includes('SECRET') || k.endsWith('_'))
      );
      if (foundKey) {
        supabaseKey = process.env[foundKey];
      }
    }

    // Fail gracefully with a 512 code if keys are missing
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        { error: 'Credenciais do Supabase não configuradas.' },
        { status: 512 }
      );
    }

    // Sanitize and heal URL format (e.g. removing extra paths or incomplete parts)
    supabaseUrl = supabaseUrl.trim();
    if (supabaseUrl.includes('ypuwizzaokddsllegmj') && !supabaseUrl.endsWith('.co')) {
      supabaseUrl = 'https://ypuwizzaokddsllegmjl.supabase.co';
    }
    
    // Remove query endpoint path, if present
    supabaseUrl = supabaseUrl.replace(/\/rest\/v1\/?$/, '');
    supabaseUrl = supabaseUrl.replace(/\/+$/, '');

    // Make sure it starts with https://
    if (!supabaseUrl.startsWith('http://') && !supabaseUrl.startsWith('https://')) {
      supabaseUrl = `https://${supabaseUrl}`;
    }

    // Create a pristine Supabase client
    const supabase = createClient(supabaseUrl, supabaseKey.trim(), {
      auth: {
        persistSession: false,
      },
    });

    // Insertion operation on the 'leads' table
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
      console.error('Database insertion error:', error);
      return NextResponse.json(
        { 
          error: 'Erro de banco de dados.', 
          details: error.message, 
          code: error.code 
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    console.error('Server execution error:', err);
    return NextResponse.json(
      { error: 'Erro interno no servidor.', details: err.message },
      { status: 500 }
    );
  }
}
