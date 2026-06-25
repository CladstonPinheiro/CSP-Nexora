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
  services:              string[];
  areas_served:          string[];
  differentials:         string[];
  parking:               string | null;
  service_options:       string[];
  rating:                number | null;
  total_reviews:         number | null;
  extra_phones:          string[];
  payments:              string[];
  accessibility:         string[];
  instagram_followers:   number | null;
  instagram_following:   number | null;
  instagram_posts:       number | null;
  color_palette:         string[];
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
  'gemini-2.5-flash',
  'gemini-2.5-flash-lite',
];

async function callGeminiWithFallback(apiKey: string, body: string): Promise<{ res: Response; model: string }> {
  for (const model of GEMINI_MODELS) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

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
  const { rawText, logoUrl: rawLogoUrl } = await req.json();

  function extractImageUrl(input: string): string {
    const htmlMatch = input.match(/src="([^"]+)"/);
    if (htmlMatch) return htmlMatch[1];
    const bbMatch = input.match(/\[img\]([^\[]+)\[\/img\]/i);
    if (bbMatch) return bbMatch[1];
    return input.trim();
  }

  const logoUrl = rawLogoUrl?.trim() ? extractImageUrl(rawLogoUrl) : null;

  if (!rawText?.trim()) {
    return NextResponse.json({ error: 'rawText é obrigatório.' }, { status: 400 });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('[gmn/extract] GEMINI_API_KEY ausente nas variáveis de ambiente');
    return NextResponse.json({ error: 'GEMINI_API_KEY não configurada.' }, { status: 500 });
  }
  // Fetch da imagem da logo para análise de cores
  let logoBase64: string | null = null;
  let logoMimeType: string = 'image/png';
  if (logoUrl) {
    try {
      const imgRes = await fetch(logoUrl);
      const imgBuffer = await imgRes.arrayBuffer();
      logoBase64 = Buffer.from(imgBuffer).toString('base64');
      logoMimeType = imgRes.headers.get('content-type') ?? 'image/png';
    } catch {
      console.warn('[gmn/extract] Não foi possível fazer fetch da logo');
    }
  }

  const prompt = `Você é um extrator de dados especializado em perfis do Google Meu Negócio.

REGRAS GERAIS:
- Extraia TUDO que estiver presente no texto, sem exceção.
- Campos ausentes: null. Arrays sem dados: [].
- Não invente informações ausentes.
- "phone" e "extra_phones": apenas dígitos. Ex: "61999990000".
- "instagram": apenas o handle sem "@" e sem URL.
- "facebook": apenas o nome/handle sem URL.
- "niche": classifique entre "imobiliaria", "administradora_imoveis", "administradora_condominios" ou "outro".
- "gmn_category": categoria principal. Ex: "Pet Shop", "Lavanderia".
- "business_hours": objeto por dia. Ex: {"Segunda": "09:00–18:00", "Domingo": "Fechado"}.
- "rating": número decimal. "total_reviews": número inteiro.
- "maps_url": URL completa do Google Maps se presente.
- "description_full": descrição completa exatamente como aparece no texto.
- "description_short": primeiras 2 frases da descrição.
- "service_options": formas de atendimento. Ex: ["Entrega", "Visita rápida"].
- "payments": formas de pagamento. Ex: ["Cartão de crédito", "PIX"].
- "accessibility": recursos de acessibilidade. Ex: ["Entrada acessível para cadeiras de rodas"].
- "areas_served": todos os bairros ou regiões mencionados.
- "address": use sempre o endereço principal listado no campo "Endereço" do perfil GMN. Ignore endereços secundários encontrados em descrições, Instagram ou outros campos. O endereço principal geralmente contém cidade, estado e CEP formatados.
- "differentials": extraia de avaliações e descrição os diferenciais competitivos do negócio. Cada item deve ser uma frase curta, objetiva e no infinitivo ou substantivo. Máximo 8 itens. Exemplos corretos: "Atendimento 24h", "Equipe especializada", "Ambiente limpo e organizado", "Busca e entrega inclusos". Exemplos incorretos: parágrafos inteiros de avaliações ou frases longas com mais de 8 palavras.
- "extra_phones": telefones adicionais além do principal.
- "instagram_followers", "instagram_following", "instagram_posts": números do perfil Instagram se presentes.
- "color_palette": ${logoBase64 ? 'analise a imagem da logo fornecida e retorne as 3 a 5 cores principais em hexadecimal. Ex: ["#FF5733", "#1A1A1A"].' : 'retorne [].'}

Retorne APENAS um objeto JSON válido, sem texto adicional, markdown ou blocos de código:
{
  "company_name": null,
  "slogan": null,
  "phone": null,
  "extra_phones": [],
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
  "instagram_followers": null,
  "instagram_following": null,
  "instagram_posts": null,
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
  "payments": [],
  "accessibility": [],
  "parking": null,
  "service_options": [],
  "rating": null,
  "total_reviews": null,
  "color_palette": []
}

TEXTO DO GOOGLE MEU NEGÓCIO:
${rawText}`;

  // Monta parts da requisição — texto + imagem se disponível
  const parts: object[] = [{ text: prompt }];
  if (logoBase64) {
    parts.push({
      inline_data: {
        mime_type: logoMimeType,
        data: logoBase64,
      },
    });
  }

  const geminiBody = JSON.stringify({
    contents: [{ parts }],
    generationConfig: { responseMimeType: 'application/json', temperature: 0.1 },
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

    if (logoUrl) {
      parsed.logo_url = logoUrl;
    }
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
