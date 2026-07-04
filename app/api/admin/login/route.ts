import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { createAdminClient } from '@/lib/supabase';

const JANELA_MINUTOS = 15;
const LIMITE_TENTATIVAS = 5;

async function registrarTentativa(email: string, sucesso: boolean, ip: string | null) {
  const supabase = createAdminClient();
  await supabase.from('tentativas_login').insert([{ email, sucesso, ip }]);
}

export async function POST(req: NextRequest) {
  const { email, password, recaptchaToken } = await req.json();

  if (!email || !password) {
    return NextResponse.json({ error: 'Email e senha são obrigatórios.' }, { status: 400 });
  }

  const secretKey = process.env.RECAPTCHA_SECRET_KEY;
  if (!secretKey) {
    return NextResponse.json({ error: 'Configuração de segurança incompleta no servidor.' }, { status: 500 });
  }
  if (!recaptchaToken) {
    return NextResponse.json({ error: 'Token de verificação ausente. Recarregue a página e tente novamente.' }, { status: 400 });
  }

  const verifyRes = await fetch('https://www.google.com/recaptcha/api/siteverify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ secret: secretKey, response: recaptchaToken }).toString(),
  });
  const verifyData = await verifyRes.json();
  if (!verifyData.success || verifyData.score < 0.5) {
    return NextResponse.json({ error: 'Verificação de segurança falhou. Tente novamente.' }, { status: 400 });
  }

  const ip = req.headers.get('x-forwarded-for');
  const adminSupabase = createAdminClient();

  const janelaInicio = new Date(Date.now() - JANELA_MINUTOS * 60 * 1000).toISOString();
  const { data: tentativasRecentes } = await adminSupabase
    .from('tentativas_login')
    .select('created_at')
    .eq('email', email)
    .eq('sucesso', false)
    .gte('created_at', janelaInicio)
    .order('created_at', { ascending: true });

  if ((tentativasRecentes?.length ?? 0) >= LIMITE_TENTATIVAS) {
    const maisAntiga = new Date(tentativasRecentes![0].created_at);
    const liberaEm = new Date(maisAntiga.getTime() + JANELA_MINUTOS * 60 * 1000);
    const minutosRestantes = Math.max(1, Math.ceil((liberaEm.getTime() - Date.now()) / (60 * 1000)));
    return NextResponse.json(
      { error: `Muitas tentativas. Tente novamente em ${minutosRestantes} minuto${minutosRestantes !== 1 ? 's' : ''}.` },
      { status: 429 }
    );
  }

  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) =>
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          ),
      },
      cookieOptions: { secure: process.env.NODE_ENV === 'production' },
    }
  );

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  await registrarTentativa(email, !error, ip);

  if (error) {
    return NextResponse.json({ error: 'Email ou senha incorretos.' }, { status: 401 });
  }

  return NextResponse.json({ success: true });
}
