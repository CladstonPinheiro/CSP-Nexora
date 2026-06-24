import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';

export interface GmnExtracted {
  company_name: string;
  phone: string;
  address: string;
  city: string;
  services: string[];
  instagram: string;
  facebook: string;
  whatsapp: string;
  description: string;
  niche: string;
}

export async function POST(req: NextRequest) {
  const { rawText } = await req.json();

  if (!rawText?.trim()) {
    return NextResponse.json({ error: 'rawText é obrigatório.' }, { status: 400 });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'GEMINI_API_KEY não configurada.' }, { status: 500 });
  }

  const prompt = `Você é um extrator de dados estruturados. Analise o texto abaixo, copiado de um perfil do Google Meu Negócio, e extraia as informações disponíveis.

REGRAS OBRIGATÓRIAS:
- Extraia APENAS dados que estejam explicitamente presentes no texto. Nunca invente ou assuma informações.
- Para campos ausentes, use string vazia "" ou array vazio [].
- Para "niche", classifique entre: "imobiliaria", "administradora_imoveis", "administradora_condominios" ou "outro".
- Para "city", extraia apenas o nome da cidade, sem estado ou país.
- Para "services", liste cada serviço como um item separado do array.
- Para "phone" e "whatsapp", retorne apenas dígitos (sem formatação).

Retorne APENAS um objeto JSON válido, sem texto adicional, markdown ou blocos de código, com exatamente estes campos:
{
  "company_name": "",
  "phone": "",
  "address": "",
  "city": "",
  "services": [],
  "instagram": "",
  "facebook": "",
  "whatsapp": "",
  "description": "",
  "niche": ""
}

TEXTO DO GOOGLE MEU NEGÓCIO:
${rawText}`;

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
      const err = await res.text();
      console.error('[gmn/extract] Gemini error:', res.status, err);
      return NextResponse.json({ error: 'Erro ao chamar Gemini.' }, { status: 500 });
    }

    const geminiData = await res.json();
    const raw = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';

    let parsed: GmnExtracted;
    try {
      parsed = JSON.parse(raw);
    } catch {
      console.error('[gmn/extract] falha ao parsear JSON:', raw);
      return NextResponse.json({ error: 'Resposta inválida do Gemini.' }, { status: 500 });
    }

    const supabase = createAdminClient();
    const { data: prospect, error: dbError } = await supabase
      .from('gmn_prospects')
      .insert({
        company_name: parsed.company_name,
        phone:        parsed.phone,
        address:      parsed.address,
        city:         parsed.city,
        instagram:    parsed.instagram,
        facebook:     parsed.facebook,
        whatsapp:     parsed.whatsapp,
        description:  parsed.description,
        niche:        parsed.niche,
        services:     parsed.services,
        raw_text:     rawText,
      })
      .select('id')
      .single();

    if (dbError) {
      console.error('[gmn/extract] erro ao salvar prospect:', dbError.message);
    }

    return NextResponse.json({ data: parsed, prospectId: prospect?.id ?? null });
  } catch (err) {
    console.error('[gmn/extract] erro inesperado:', err);
    return NextResponse.json({ error: 'Erro interno.' }, { status: 500 });
  }
}
