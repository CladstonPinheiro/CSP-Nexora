import { createAdminClient } from '@/lib/supabase';
import { sendLeadNotification } from '@/lib/mailer';
import { qualificarLead } from '@/lib/gemini';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { nome, email, empresa, telefone, niche, source, notes, recaptchaToken } = await req.json();

    if (!nome || !email || !empresa || !telefone) {
      return NextResponse.json(
        { error: 'Todos os campos são obrigatórios.' },
        { status: 400 }
      );
    }

    if (source !== 'prospeccao_ia') {
      const secretKey = process.env.RECAPTCHA_SECRET_KEY;
      if (!secretKey) {
        return NextResponse.json(
          { error: 'Configuração de segurança incompleta no servidor.' },
          { status: 500 }
        );
      }

      if (!recaptchaToken) {
        return NextResponse.json(
          { error: 'Token de verificação ausente. Recarregue a página e tente novamente.' },
          { status: 400 }
        );
      }

      const verifyRes = await fetch('https://www.google.com/recaptcha/api/siteverify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ secret: secretKey, response: recaptchaToken }).toString(),
      });

      const verifyData = await verifyRes.json();

      if (!verifyData.success || verifyData.score < 0.5) {
        return NextResponse.json(
          { error: 'Verificação de segurança falhou. Tente novamente.' },
          { status: 400 }
        );
      }
    }

    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from('leads')
      .insert([{
        contact_name: nome,
        company_name: empresa,
        phone:        telefone,
        email,
        niche:        niche || null,
        source:       source || 'formulario',
        stage:        'identificado',
        notes:        notes || null,
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

    try {
      await sendLeadNotification({ nome, email, empresa, telefone });
    } catch (err) {
      console.error('[mailer] lead notification failed:', err);
    }

    await qualificarLead({
      id:           data.id,
      company_name: empresa,
      niche:        niche || null,
      city:         data.city ?? null,
      notes:        data.notes ?? null,
    });

    return NextResponse.json({ success: true, data });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erro desconhecido';
    return NextResponse.json(
      { error: 'Erro interno no servidor.', details: message },
      { status: 500 }
    );
  }
}
