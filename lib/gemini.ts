import { createAdminClient } from '@/lib/supabase';

interface LeadParams {
  id: string;
  company_name?: string | null;
  niche?: string | null;
  city?: string | null;
  notes?: string | null;
}

interface GeminiScore {
  score: 'alto' | 'medio' | 'baixo';
  reasoning: string;
}

export async function qualificarLead({ id, company_name, niche, city, notes }: LeadParams) {
  if (!company_name || !niche) return;

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('[gemini] GEMINI_API_KEY não configurada');
    return;
  }

  try {
    const prompt = `Você é um analista de negócios da CSP Nexora, empresa especializada em automação inteligente de processos para negócios do setor imobiliário e de gestão de imóveis.

Avalie o potencial deste lead como cliente da CSP Nexora com base nas informações abaixo:
- Empresa: ${company_name}
- Nicho: ${niche}
- Cidade: ${city ?? 'não informada'}
- Anotações: ${notes ?? 'nenhuma'}

Retorne APENAS um objeto JSON válido, sem texto adicional, markdown ou blocos de código, com exatamente dois campos:
- "score": uma das três opções: "alto", "medio" ou "baixo"
- "reasoning": texto curto explicando o motivo, máximo 2 frases em português

Exemplo de resposta esperada:
{"score":"alto","reasoning":"Empresa do nicho imobiliário com alto volume de contratos, perfil ideal para automação de processos. A localização em grande centro urbano aumenta o potencial de ROI com nossas soluções."}`;

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: 'application/json', temperature: 0.2 },
        }),
      }
    );

    if (!res.ok) {
      console.error('[gemini] erro na API:', res.status, await res.text());
      return;
    }

    const geminiData = await res.json();
    const raw = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';

    let parsed: GeminiScore;
    try {
      parsed = JSON.parse(raw);
    } catch {
      console.error('[gemini] falha ao parsear JSON:', raw);
      return;
    }

    if (!parsed.score || !parsed.reasoning) {
      console.error('[gemini] resposta incompleta:', parsed);
      return;
    }

    const supabase = createAdminClient();
    const { error } = await supabase
      .from('leads')
      .update({
        ai_score:        parsed.score,
        ai_reasoning:    parsed.reasoning,
        ai_qualified_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) {
      console.error('[gemini] erro ao salvar qualificação:', error.message);
    }
  } catch (err) {
    console.error('[gemini] erro inesperado:', err);
  }
}
