'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, AlertTriangle, RotateCcw, Save, FileDown } from 'lucide-react';
import { createSupabaseBrowserClient } from '@/lib/supabase';
import { getBriefing } from '../briefing/actions';
import type { Briefing } from '../briefing/_components/types';
import { getPrecificacao, savePrecificacao } from './actions';
import { ESTRATEGIA_OPTIONS, type EstrategiaCobranca } from './_components/types';
import type { Lead } from '../../_components/types';
import {
  getSetupBaseCalculado,
  getAcrescimosDetalhados,
  getSetupAcrescimosTotal,
  getMultiplicadorSugerido,
  getLeadsMesEstimado,
  getRecorrenciaValorCalculado,
} from '@/lib/precificacao';

const INPUT =
  'w-full bg-[#111] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder-gray-700 focus:outline-none focus:border-white/20 transition-all';
const TEXTAREA =
  'w-full bg-[#111] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder-gray-700 focus:outline-none focus:border-white/20 transition-all resize-y min-h-[80px]';
const LABEL = 'block text-[10px] font-black uppercase tracking-widest text-[#F0F0F0] mb-1.5';
const CARD = 'bg-[#0A0A0A] border border-white/10 rounded-2xl p-6';

function formatCurrency(value: number | null) {
  if (value == null) return '—';
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function RecalcularButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-cyan-400 hover:text-cyan-300 transition-colors"
    >
      <RotateCcw className="w-2.5 h-2.5" />
      Recalcular
    </button>
  );
}

export default function PrecificacaoPage() {
  const params = useParams<{ id: string }>();
  const leadId = params.id;

  const [lead, setLead] = useState<Lead | null>(null);
  const [briefing, setBriefing] = useState<Briefing | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const [pdfError, setPdfError] = useState('');

  const [setupBaseCalculado, setSetupBaseCalculado] = useState<number | null>(null);
  const [acrescimosDetalhados, setAcrescimosDetalhados] = useState<{ value: string; label: string; amount: number }[]>([]);
  const [acrescimosTotal, setAcrescimosTotal] = useState(0);

  const [setupMultiplicador, setSetupMultiplicador] = useState('1');
  const [setupValorFinal, setSetupValorFinal] = useState('');
  const [setupFinalDirty, setSetupFinalDirty] = useState(false);

  const [leadsMesEstimado, setLeadsMesEstimado] = useState('');
  const [recorrenciaValorCalculado, setRecorrenciaValorCalculado] = useState<number | null>(null);
  const [recorrenciaValorFinal, setRecorrenciaValorFinal] = useState('');
  const [recorrenciaFinalDirty, setRecorrenciaFinalDirty] = useState(false);

  const [estrategiaCobranca, setEstrategiaCobranca] = useState<EstrategiaCobranca | ''>('');
  const [observacoes, setObservacoes] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    const supabase = createSupabaseBrowserClient();
    const [{ data: leadData }, briefingResult, precificacaoResult] = await Promise.all([
      supabase.from('leads').select('*').eq('id', leadId).single(),
      getBriefing(leadId),
      getPrecificacao(leadId),
    ]);

    setLead(leadData ?? null);
    const briefingData = briefingResult.data ?? null;
    setBriefing(briefingData);

    if (!briefingData) {
      setLoading(false);
      return;
    }

    const integracoes = briefingData.integracoes_desejadas ?? [];
    const base = getSetupBaseCalculado(briefingData.numero_agendas ?? null, briefingData.numero_fluxos_automacao ?? null);
    const detalhes = getAcrescimosDetalhados(integracoes);
    const total = getSetupAcrescimosTotal(integracoes);
    const multiplicadorSugerido = getMultiplicadorSugerido(briefingData.ticket_medio);
    const setupFinalSugerido = base != null ? (base + total) * multiplicadorSugerido : null;
    const leadsMesSugerido = getLeadsMesEstimado(briefingData.atendimentos_por_dia);
    const recorrenciaSugerida = getRecorrenciaValorCalculado(leadsMesSugerido);

    setSetupBaseCalculado(base);
    setAcrescimosDetalhados(detalhes);
    setAcrescimosTotal(total);

    const precificacao = precificacaoResult.data ?? null;

    if (precificacao) {
      setSetupMultiplicador((precificacao.setup_multiplicador ?? multiplicadorSugerido).toString());
      setSetupValorFinal(precificacao.setup_valor_final?.toString() ?? (setupFinalSugerido?.toFixed(2) ?? ''));
      setSetupFinalDirty(true);

      setLeadsMesEstimado(precificacao.leads_mes_estimado?.toString() ?? (leadsMesSugerido?.toString() ?? ''));
      setRecorrenciaValorCalculado(precificacao.recorrencia_valor_calculado ?? recorrenciaSugerida);
      setRecorrenciaValorFinal(precificacao.recorrencia_valor_final?.toString() ?? (recorrenciaSugerida?.toFixed(2) ?? ''));
      setRecorrenciaFinalDirty(true);

      setEstrategiaCobranca(precificacao.estrategia_cobranca ?? '');
      setObservacoes(precificacao.observacoes_precificacao ?? '');
    } else {
      setSetupMultiplicador(multiplicadorSugerido.toString());
      setSetupValorFinal(setupFinalSugerido != null ? setupFinalSugerido.toFixed(2) : '');
      setSetupFinalDirty(false);

      setLeadsMesEstimado(leadsMesSugerido != null ? leadsMesSugerido.toString() : '');
      setRecorrenciaValorCalculado(recorrenciaSugerida);
      setRecorrenciaValorFinal(recorrenciaSugerida != null ? recorrenciaSugerida.toFixed(2) : '');
      setRecorrenciaFinalDirty(false);
    }

    setLoading(false);
  }, [leadId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleMultiplicadorChange = (value: string) => {
    setSetupMultiplicador(value);
    if (!setupFinalDirty && setupBaseCalculado != null) {
      const m = parseFloat(value);
      if (!Number.isNaN(m)) {
        setSetupValorFinal(((setupBaseCalculado + acrescimosTotal) * m).toFixed(2));
      }
    }
  };

  const handleRecalcularSetup = () => {
    setSetupFinalDirty(false);
    if (setupBaseCalculado != null) {
      const m = parseFloat(setupMultiplicador);
      setSetupValorFinal(((setupBaseCalculado + acrescimosTotal) * (Number.isNaN(m) ? 1 : m)).toFixed(2));
    }
  };

  const handleLeadsMesChange = (value: string) => {
    setLeadsMesEstimado(value);
    const n = value.trim() === '' ? null : parseInt(value, 10);
    const calc = getRecorrenciaValorCalculado(n != null && Number.isNaN(n) ? null : n);
    setRecorrenciaValorCalculado(calc);
    if (!recorrenciaFinalDirty) {
      setRecorrenciaValorFinal(calc != null ? calc.toFixed(2) : '');
    }
  };

  const handleRecalcularRecorrencia = () => {
    setRecorrenciaFinalDirty(false);
    setRecorrenciaValorFinal(recorrenciaValorCalculado != null ? recorrenciaValorCalculado.toFixed(2) : '');
  };

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    const payload = {
      setup_base_calculado: setupBaseCalculado,
      setup_acrescimos: acrescimosTotal,
      setup_multiplicador: setupMultiplicador.trim() === '' ? null : parseFloat(setupMultiplicador),
      setup_valor_final: setupValorFinal.trim() === '' ? null : parseFloat(setupValorFinal),
      leads_mes_estimado: leadsMesEstimado.trim() === '' ? null : parseInt(leadsMesEstimado, 10),
      recorrencia_valor_calculado: recorrenciaValorCalculado,
      recorrencia_valor_final: recorrenciaValorFinal.trim() === '' ? null : parseFloat(recorrenciaValorFinal),
      estrategia_cobranca: estrategiaCobranca || null,
      observacoes_precificacao: observacoes || null,
    };
    const { error } = await savePrecificacao(leadId, payload);
    setSaving(false);
    if (!error) setSaved(true);
  };

  const handleGeneratePdf = async () => {
    setGeneratingPdf(true);
    setPdfError('');
    try {
      const res = await fetch(`/api/leads/${leadId}/proposta-pdf`);
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setPdfError(body.error ?? 'Erro ao gerar o PDF.');
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const nomeArquivo = lead?.company_name
        ? lead.company_name.replace(/[^a-zA-Z0-9À-ÿ\s]/g, '').trim().replace(/\s+/g, '_')
        : 'lead';
      const a = document.createElement('a');
      a.href = url;
      a.download = `Proposta_${nomeArquivo}.pdf`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 10000);
    } catch {
      setPdfError('Erro ao gerar o PDF.');
    } finally {
      setGeneratingPdf(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 min-h-screen">
        <div className="h-6 w-40 bg-white/5 rounded-lg animate-pulse mb-8" />
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-40 bg-white/5 rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 min-h-screen max-w-3xl">
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/admin/leads"
          className="inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-widest text-gray-600 hover:text-white transition-colors mb-4"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Voltar para Leads
        </Link>
        <h1 className="font-outfit text-3xl font-black tracking-tight text-white">
          Precificação
        </h1>
        <p className="text-gray-600 text-sm mt-1">
          {lead?.company_name || 'Lead não encontrado'}
        </p>
      </div>

      {!briefing ? (
        <div className="flex items-start gap-3 px-5 py-4 rounded-xl bg-amber-400/10 border border-amber-400/20 text-amber-400">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold">Preencha o briefing primeiro</p>
            <p className="text-xs text-amber-400/70 mt-1">
              A calculadora usa dados coletados no briefing (agendas, fluxos de automação, integrações, ticket médio e atendimentos por dia).
            </p>
            <Link
              href={`/admin/leads/${leadId}/briefing`}
              className="inline-flex items-center gap-1.5 mt-3 text-[11px] font-black uppercase tracking-widest text-amber-400 hover:text-amber-300 transition-colors"
            >
              Ir para o Briefing
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-5">
          {/* Setup */}
          <div className={CARD}>
            <p className="text-[9px] font-black uppercase tracking-widest text-gray-700 mb-5">
              Setup
            </p>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-[9px] font-black uppercase tracking-widest text-gray-700 mb-1">Base calculada</p>
                  <p className="text-white font-bold">{formatCurrency(setupBaseCalculado)}</p>
                </div>
                <div>
                  <p className="text-[9px] font-black uppercase tracking-widest text-gray-700 mb-1">Total de acréscimos</p>
                  <p className="text-white font-bold">{formatCurrency(acrescimosTotal)}</p>
                </div>
              </div>

              {acrescimosDetalhados.length > 0 && (
                <div>
                  <p className="text-[9px] font-black uppercase tracking-widest text-gray-700 mb-2">Acréscimos por integração</p>
                  <div className="space-y-1.5">
                    {acrescimosDetalhados.map((item) => (
                      <div key={item.value} className="flex items-center justify-between text-xs text-gray-400">
                        <span>{item.label}</span>
                        <span className="text-gray-300 font-bold">{formatCurrency(item.amount)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={LABEL}>Multiplicador de porte</label>
                  <input
                    type="number"
                    step="0.1"
                    className={INPUT}
                    value={setupMultiplicador}
                    onChange={(e) => handleMultiplicadorChange(e.target.value)}
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className={LABEL}>Setup — valor final (R$)</label>
                    {setupFinalDirty && <RecalcularButton onClick={handleRecalcularSetup} />}
                  </div>
                  <input
                    type="number"
                    step="0.01"
                    className={INPUT}
                    value={setupValorFinal}
                    onChange={(e) => {
                      setSetupValorFinal(e.target.value);
                      setSetupFinalDirty(true);
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Recorrência */}
          <div className={CARD}>
            <p className="text-[9px] font-black uppercase tracking-widest text-gray-700 mb-5">
              Recorrência
            </p>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={LABEL}>Leads/mês estimado</label>
                  <input
                    type="number"
                    className={INPUT}
                    value={leadsMesEstimado}
                    onChange={(e) => handleLeadsMesChange(e.target.value)}
                  />
                </div>
                <div>
                  <p className={LABEL}>Recorrência calculada</p>
                  <p className="text-white font-bold text-sm pt-2.5">{formatCurrency(recorrenciaValorCalculado)}</p>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className={LABEL}>Recorrência — valor final (R$)</label>
                  {recorrenciaFinalDirty && <RecalcularButton onClick={handleRecalcularRecorrencia} />}
                </div>
                <input
                  type="number"
                  step="0.01"
                  className={INPUT}
                  value={recorrenciaValorFinal}
                  onChange={(e) => {
                    setRecorrenciaValorFinal(e.target.value);
                    setRecorrenciaFinalDirty(true);
                  }}
                />
              </div>
            </div>
          </div>

          {/* Estratégia de Cobrança */}
          <div className={CARD}>
            <p className="text-[9px] font-black uppercase tracking-widest text-gray-700 mb-5">
              Estratégia de Cobrança
            </p>
            <select
              className={INPUT}
              value={estrategiaCobranca}
              onChange={(e) => setEstrategiaCobranca(e.target.value as EstrategiaCobranca)}
              style={{ backgroundColor: '#111' }}
            >
              <option value="">Selecione...</option>
              {ESTRATEGIA_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          {/* Observações */}
          <div className={CARD}>
            <p className="text-[9px] font-black uppercase tracking-widest text-gray-700 mb-5">
              Observações
            </p>
            <textarea
              className={TEXTAREA}
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              rows={4}
            />
          </div>

          {/* Save + PDF buttons */}
          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={handleSave}
              disabled={saving}
              className="relative group disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl blur opacity-30 group-hover:opacity-60 transition duration-300" />
              <div className="relative flex items-center justify-center gap-2 bg-white text-black px-6 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all hover:scale-[1.01] active:scale-[0.99]">
                <Save className="w-3.5 h-3.5" />
                {saving ? 'Salvando...' : saved ? 'Salvo!' : 'Salvar Precificação'}
              </div>
            </button>

            <button
              onClick={handleGeneratePdf}
              disabled={generatingPdf}
              className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-gray-300 hover:text-white text-[11px] font-black uppercase tracking-widest transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <FileDown className="w-3.5 h-3.5" />
              {generatingPdf ? 'Gerando...' : 'Gerar Proposta em PDF'}
            </button>
          </div>
          {pdfError && (
            <p className="text-xs text-red-400">{pdfError}</p>
          )}
        </div>
      )}
    </div>
  );
}
