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

export async function POST(req: NextRequest) {
  const { rawText } = await req.json();

  if (!rawText?.trim()) {
    return NextResponse.json({ error: 'rawText é obrigatório.' }, { status: 400 });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'GEMINI_API_KEY não configurada.' }, { status: 500 });
  }

  const prompt = `Você é um extrator de dados estruturados especializado em perfis do Google Meu Negócio. Analise o texto abaixo, extraia os dados presentes E aplique as inferências descritas abaixo.

REGRAS GERAIS:
- Campos sem nenhuma base no texto devem ser null. Arrays sem dados devem ser [].
- Nunca invente dados que não possam ser inferidos logicamente das informações presentes.

REGRAS ESPECÍFICAS POR CAMPO:
- "phone": apenas dígitos, sem formatação. Ex: "61999990000".
- "whatsapp": SEMPRE preencher — use o número explícito de WhatsApp se mencionado; caso contrário, use o mesmo valor de "phone" (apenas dígitos). Nunca deixar null se "phone" existir.
- "instagram": apenas o @handle sem URL, sem o "@". Ex: "minha.loja".
- "instagram_url": SEMPRE inferir como "https://www.instagram.com/" + instagram se "instagram" não for null. Ex: "https://www.instagram.com/minha.loja".
- "facebook": apenas o nome/handle da página, sem URL.
- "facebook_url": SEMPRE inferir como "https://www.facebook.com/" + facebook se "facebook" não for null.
- "neighborhood": extrair do endereço — geralmente o bairro aparece antes da cidade. Ex: "QE 30 Guará II, Brasília" → "Guará II". Se não identificável, null.
- "city": apenas o nome da cidade, sem estado ou país. Ex: "Brasília".
- "state": sigla do estado extraída do endereço. Ex: "DF", "SP", "RJ". Se não presente, null.
- "cep": 8 dígitos sem hífen, extraído do endereço se presente. Ex: "71060300".
- "maps_url": URL do Google Maps se presente no texto (começa com "https://maps.app.goo.gl/" ou "https://www.google.com/maps/"). null se ausente.
- "niche": classifique entre "imobiliaria", "administradora_imoveis", "administradora_condominios" ou "outro".
- "gmn_category": categoria principal do negócio mencionada no texto. Ex: "Lavanderia", "Imobiliária", "Restaurante". null se não identificável.
- "is_open_24h": SEMPRE inferir — true se o texto contiver "24 horas", "24h", "aberto 24", "funciona 24" ou variações. false se horários específicos indicarem fechamento. null apenas se nenhuma informação de horário existir.
- "business_hours": objeto com cada dia como chave e horário como valor. Ex: {"Segunda": "09:00–18:00", "Sábado": "09:00–13:00"}. null se não houver horários.
- "description_full": descrição completa extraída do texto, exatamente como aparece.
- "description_short": SEMPRE preencher se "description_full" não for null — resuma em até 2 frases curtas e diretas destacando o que o negócio faz e seu principal diferencial.
- "differentials": SEMPRE preencher se houver descrição — infira os diferenciais competitivos mencionados ou implícitos. Ex: ["Atendimento 24 horas", "Autoatendimento", "Ambiente monitorado", "Máquinas modernas", "20 anos de experiência"]. [] se a descrição não oferecer base.
- "areas_served": extraia bairros, regiões ou cidades atendidas mencionados no texto. [] se não mencionado.
- "service_options": ex: ["Atendimento no local", "Visita ao cliente", "Online", "Entrega"]. [] se não mencionado.
- "rating": número decimal. Ex: 4.7. null se não presente.
- "total_reviews": número inteiro. null se não presente.
- "parking": mencione se o texto indica estacionamento disponível. null se não mencionado.
- Para "facebook": apenas o nome/handle. Para "facebook_url": a URL completa se presente.

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
        company_name:      parsed.company_name,
        slogan:            parsed.slogan,
        phone:             parsed.phone,
        address:           parsed.address,
        city:              parsed.city,
        instagram:         parsed.instagram,
        facebook:          parsed.facebook,
        whatsapp:          parsed.whatsapp,
        description:       parsed.description_full,
        niche:             parsed.niche,
        services:          parsed.services,
        logo_url:          parsed.logo_url,
        maps_url:          parsed.maps_url,
        business_hours:    parsed.business_hours,
        areas_served:      parsed.areas_served,
        differentials:     parsed.differentials,
        raw_text:          rawText,
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
