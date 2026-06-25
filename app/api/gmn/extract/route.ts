import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';

export interface GmnExtracted {
  company_name:      string | null;
  slogan:            string | null;
  phone:             string | null;
  email:             string | null;
  address:           string | null;
  city:              string | null;
  neighborhood:      string | null;
  cep:               string | null;
  state:             string | null;
  maps_url:          string | null;
  business_hours:    Record<string, string> | null;
  is_open_24h:       boolean | null;
  instagram:         string | null;
  instagram_url:     string | null;
  facebook:          string | null;
  facebook_url:      string | null;
  whatsapp:          string | null;
  logo_url:          string | null;
  website:           string | null;
  description_short: string | null;
  description_full:  string | null;
  niche:             string | null;
  gmn_category:      string | null;
  services:          string[];
  areas_served:      string[];
  differentials:     string[];
  parking:           string | null;
  service_options:   string[];
  rating:            number | null;
  total_reviews:     number | null;
}

const DIFFERENTIAL_KEYWORDS = [
  'moderno', 'moderna', 'modernos', 'modernas',
  '24', 'seguro', 'segura', 'limpo', 'limpa',
  'rápido', 'rápida', 'fácil', 'qualidade',
  'experiência', 'anos', 'atendimento', 'especializado',
  'exclusivo', 'completo', 'tecnologia', 'automatizado',
];

function inferFields(parsed: GmnExtracted, rawText: string): GmnExtracted {
  const p = { ...parsed };
  const desc = p.description_full ?? '';
  const searchText = (desc + ' ' + rawText).toLowerCase();

  // neighborhood: primeira parte do address antes da primeira vírgula
  if (!p.neighborhood && p.address) {
    const before = p.address.split(',')[0]?.trim();
    if (before && before !== p.address.trim()) p.neighborhood = before;
  }

  // cep: regex no address
  if (!p.cep && p.address) {
    const match = p.address.match(/\d{5}-?\d{3}/);
    if (match) p.cep = match[0].replace('-', '');
  }

  // state: sigla de 2 letras maiúsculas no address
  if (!p.state && p.address) {
    const match = p.address.match(/\b([A-Z]{2})\b/);
    if (match) p.state = match[1];
  }

  // instagram_url
  if (!p.instagram_url && p.instagram) {
    p.instagram_url = `https://www.instagram.com/${p.instagram}`;
  }

  // facebook_url
  if (!p.facebook_url && p.facebook) {
    p.facebook_url = `https://www.facebook.com/${p.facebook}`;
  }

  // whatsapp: fallback para phone
  if (!p.whatsapp && p.phone) {
    p.whatsapp = p.phone;
  }

  // is_open_24h
  if (p.is_open_24h === null) {
    const open24 = /24\s*h(oras?)?|aberto\s+24|funciona\s+24/i.test(searchText);
    if (open24) p.is_open_24h = true;
  }

  // description_short: primeiras 2 frases da description_full
  if (!p.description_short && desc) {
    const sentences = desc.match(/[^.!?]+[.!?]+/g) ?? [];
    p.description_short = sentences.slice(0, 2).join(' ').trim() || desc.slice(0, 160);
  }

  // differentials: frases da descrição com palavras-chave
  if (p.differentials.length === 0 && desc) {
    const sentences = desc.match(/[^.!?,;]+[.!?,;]*/g) ?? [];
    const found = sentences
      .map((s) => s.trim().replace(/[,\.]+$/, ''))
      .filter((s) => s.length >= 15 && DIFFERENTIAL_KEYWORDS.some((kw) => s.toLowerCase().includes(kw)))
      .slice(0, 5);
    if (found.length > 0) p.differentials = found;
  }

  return p;
}

const GEMINI_MODELS = [
  'gemini-2.0-flash',
  'gemini-2.0-flash-lite',
  'gemini-1.5-pro',
];

async function callGeminiWithFallback(apiKey: string, body: string): Promise<{ res: Response; model: string }> {
  for (const model of GEMINI_MODELS) {
    const url = `https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${apiKey}`;

    let res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
    });

    if (res.status === 503) {
      await new Promise((r) => setTimeout(r, 2000));
      res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
      });
    }

    if (res.status === 429) {
      console.warn(`[gmn/extract] ${model} quota excedida — tentando próximo modelo...`);
      continue;
    }

    return { res, model };
  }

  throw new Error('Todos os modelos Gemini estão com quota excedida. Tente novamente mais tarde.');
}

export async function POST(req: NextRequest) {
  const { rawText, logoUrl } = await req.json();

  if (!rawText?.trim()) {
    return NextResponse.json({ error: 'rawText é obrigatório.' }, { status: 400 });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('[gmn/extract] GEMINI_API_KEY ausente nas variáveis de ambiente');
    return NextResponse.json({ error: 'GEMINI_API_KEY não configurada.' }, { status: 500 });
  }
  const prompt = `Você é um extrator de dados estruturados especializado em perfis do Google Meu Negócio. Analise o texto abaixo e extraia as informações disponíveis.

REGRAS:
- Extraia APENAS dados explicitamente presentes no texto. Nunca invente informações.
- Campos ausentes devem ser null. Arrays sem dados devem ser [].
- "phone": apenas dígitos. Ex: "61999990000".
- "instagram": apenas o handle sem "@" e sem URL. Ex: "minha.loja".
- "facebook": apenas o nome/handle sem URL.
- "niche": classifique entre "imobiliaria", "administradora_imoveis", "administradora_condominios" ou "outro".
- "gmn_category": categoria principal do negócio. Ex: "Lavanderia", "Imobiliária".
- "business_hours": objeto por dia. Ex: {"Segunda": "09:00–18:00"}.
- "rating": número decimal. "total_reviews": número inteiro.
- "maps_url": URL do Google Maps se presente no texto.
- "description_full": descrição completa exatamente como aparece no texto.
- "service_options": ex: ["Atendimento no local", "Online"].
- "areas_served": bairros ou regiões atendidas mencionadas.

Retorne APENAS um objeto JSON válido, sem texto adicional, markdown ou blocos de código:
{
  "company_name": null,
  "slogan": null,
  "phone": null,
  "email": null,
  "address": null,
  "city": null,
  "neighborhood": null,
  "cep": null,
  "state": null,
  "maps_url": null,
  "business_hours": null,
  "is_open_24h": null,
  "instagram": null,
  "instagram_url": null,
  "facebook": null,
  "facebook_url": null,
  "whatsapp": null,
  "logo_url": null,
  "website": null,
  "description_short": null,
  "description_full": null,
  "niche": null,
  "gmn_category": null,
  "services": [],
  "areas_served": [],
  "differentials": [],
  "parking": null,
  "service_options": [],
  "rating": null,
  "total_reviews": null
}

TEXTO DO GOOGLE MEU NEGÓCIO:
${rawText}`;

  const geminiBody = JSON.stringify({
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: { temperature: 0.1 },
  });

  try {
    const { res, model } = await callGeminiWithFallback(apiKey, geminiBody);
    console.log(`[gmn/extract] usando modelo: ${model}`);

    if (!res.ok) {
      const errBody = await res.text();
      console.error('[gmn/extract] Gemini HTTP error:', res.status, res.statusText);
      console.error('[gmn/extract] Gemini error body:', errBody);
      let geminiMessage = `HTTP ${res.status}`;
      try {
        const errJson = JSON.parse(errBody);
        geminiMessage = errJson?.error?.message ?? geminiMessage;
      } catch { /* corpo não é JSON */ }
      return NextResponse.json({ error: `Erro ao chamar Gemini: ${geminiMessage}` }, { status: 500 });
    }

    const geminiData = await res.json();
    const finishReason = geminiData?.candidates?.[0]?.finishReason;
    const raw = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
    console.log('[gmn/extract] Gemini finishReason:', finishReason, '| raw length:', raw.length);

    let parsed: GmnExtracted;
    try {
      parsed = JSON.parse(raw);
    } catch {
      console.error('[gmn/extract] falha ao parsear JSON. finishReason:', finishReason, '| raw:', raw.slice(0, 300));
      return NextResponse.json({
        error: 'Resposta inválida do Gemini.',
        details: { finishReason, rawPreview: raw.slice(0, 200) },
      }, { status: 500 });
    }

    if (logoUrl?.trim()) parsed.logo_url = logoUrl.trim();
    console.log('[GMN] parsed.address:', parsed.address);
    const enriched = inferFields(parsed, rawText);
    console.log('[GMN] enriched.neighborhood:', enriched.neighborhood, 'cep:', enriched.cep, 'state:', enriched.state, 'is_open_24h:', enriched.is_open_24h, 'description_short:', enriched.description_short?.slice(0, 50));

    const supabase = createAdminClient();
    const { data: prospect, error: dbError } = await supabase
      .from('gmn_prospects')
      .insert({
        company_name:   enriched.company_name,
        slogan:         enriched.slogan,
        phone:          enriched.phone,
        address:        enriched.address,
        city:           enriched.city,
        instagram:      enriched.instagram,
        facebook:       enriched.facebook,
        whatsapp:       enriched.whatsapp,
        description:    enriched.description_full,
        niche:          enriched.niche,
        services:       enriched.services,
        logo_url:       enriched.logo_url,
        maps_url:       enriched.maps_url,
        business_hours: enriched.business_hours,
        areas_served:   enriched.areas_served,
        differentials:  enriched.differentials,
        raw_text:       rawText,
      })
      .select('id')
      .single();

    if (dbError) {
      console.error('[gmn/extract] erro ao salvar prospect:', dbError.message);
    }

    return NextResponse.json({ data: enriched, prospectId: prospect?.id ?? null });
  } catch (err) {
    console.error('[gmn/extract] erro inesperado:', err);
    return NextResponse.json({ error: 'Erro interno.' }, { status: 500 });
  }
}
