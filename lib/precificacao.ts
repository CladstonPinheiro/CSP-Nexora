import { INTEGRACAO_OPTIONS, type IntegracaoDesejada } from '@/app/admin/(panel)/leads/[id]/briefing/_components/types';

export const SETUP_RANGES: { max: number; min: number; range: [number, number] }[] = [
  { max: 2, min: 1, range: [700, 2000] },
  { max: 6, min: 3, range: [2000, 3500] },
  { max: 10, min: 7, range: [3500, 6000] },
  { max: Infinity, min: 11, range: [6000, 10000] },
];

export function getSetupRange(numeroAgendas: number | null): { min: number; max: number } | null {
  if (numeroAgendas == null || numeroAgendas < 1) return null;
  const faixa = SETUP_RANGES.find((f) => numeroAgendas >= f.min && numeroAgendas <= f.max);
  if (!faixa) return null;
  return { min: faixa.range[0], max: faixa.range[1] };
}

export function getSetupBaseCalculado(
  numeroAgendas: number | null,
  numeroFluxosAutomacao: number | null
): number | null {
  const range = getSetupRange(numeroAgendas);
  if (!range) return null;
  const posicao = Math.min((numeroFluxosAutomacao ?? 0) / 5, 1);
  return range.min + posicao * (range.max - range.min);
}

export const ACRESCIMO_POR_INTEGRACAO: Record<IntegracaoDesejada, number> = {
  crm: 350,
  pagamento: 350,
  hotmart_kiwify: 450,
  api_propria_erp: 1500,
  sistema_medico: 1000,
  outra: 350,
};

export function getAcrescimosDetalhados(
  integracoes: IntegracaoDesejada[]
): { value: IntegracaoDesejada; label: string; amount: number }[] {
  return integracoes.map((value) => ({
    value,
    label: INTEGRACAO_OPTIONS.find((o) => o.value === value)?.label ?? value,
    amount: ACRESCIMO_POR_INTEGRACAO[value],
  }));
}

export function getSetupAcrescimosTotal(integracoes: IntegracaoDesejada[]): number {
  return integracoes.reduce((sum, value) => sum + ACRESCIMO_POR_INTEGRACAO[value], 0);
}

export function parseTicketMedio(raw: string | null | undefined): number | null {
  if (!raw) return null;
  const text = raw.toLowerCase();
  const match = text.match(/(\d{1,3}(?:[.,]\d{3})*(?:[.,]\d+)?|\d+(?:[.,]\d+)?)\s*(mil|k)?/);
  if (!match || !match[1]) return null;

  let numeric = match[1];
  const hasSuffix = !!match[2];

  // Normaliza separador de milhar: se tem "." ou "," seguido de exatamente 3 dígitos
  // no final, trata como milhar; senão, trata a última ocorrência como decimal.
  const thousandsPattern = /^\d{1,3}([.,]\d{3})+$/;
  if (thousandsPattern.test(numeric)) {
    numeric = numeric.replace(/[.,]/g, '');
  } else {
    numeric = numeric.replace(',', '.');
  }

  const value = parseFloat(numeric);
  if (Number.isNaN(value)) return null;

  return hasSuffix ? value * 1000 : value;
}

export function getMultiplicadorSugerido(ticketMedio: string | null | undefined): number {
  const valor = parseTicketMedio(ticketMedio);
  if (valor == null) return 1.0;
  if (valor <= 50000) return 1.0;
  if (valor <= 300000) return 1.3;
  return 1.6;
}

export function parseAtendimentosPorDia(raw: string | null | undefined): number | null {
  if (!raw) return null;
  const match = raw.match(/\d+/);
  if (!match) return null;
  const value = parseInt(match[0], 10);
  return Number.isNaN(value) ? null : value;
}

export function getLeadsMesEstimado(atendimentosPorDia: string | null | undefined): number | null {
  const porDia = parseAtendimentosPorDia(atendimentosPorDia);
  return porDia == null ? null : porDia * 30;
}

export function getRecorrenciaValorCalculado(leadsMesEstimado: number | null): number | null {
  if (leadsMesEstimado == null) return null;
  return leadsMesEstimado <= 1000 ? leadsMesEstimado * 1.0 : leadsMesEstimado * 0.8;
}
