'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, Sparkles } from 'lucide-react';
import { createSupabaseBrowserClient } from '@/lib/supabase';
import {
  getBriefing,
  upsertBriefingField,
  completeBriefing,
  upsertBriefingNumberField,
  upsertBriefingIntegracoes,
} from './actions';
import {
  BRIEFING_SECTIONS,
  INTEGRACAO_OPTIONS,
  type Briefing,
  type BriefingField,
  type BriefingStatus,
  type IntegracaoDesejada,
} from './_components/types';
import type { Lead } from '../../_components/types';

const TEXTAREA =
  'w-full bg-inset border border-border rounded-xl px-4 py-2.5 text-primary text-sm placeholder-gray-700 focus:outline-none focus:border-border-strong transition-all resize-y min-h-[80px]';
const TEXTAREA_AI_FILLED =
  'w-full bg-inset border border-cyan-400/40 rounded-xl px-4 py-2.5 text-primary text-sm placeholder-gray-700 focus:outline-none focus:border-cyan-400/60 transition-all resize-y min-h-[80px]';
const INPUT =
  'w-full bg-inset border border-border rounded-xl px-4 py-2.5 text-primary text-sm placeholder-gray-700 focus:outline-none focus:border-border-strong transition-all';
const LABEL = 'block text-[10px] font-black uppercase tracking-widest text-secondary mb-1.5';

type FormState = Partial<Record<BriefingField, string>>;
type SavingKey = BriefingField | 'numero_agendas' | 'numero_fluxos_automacao' | 'integracoes_desejadas';

function briefingToForm(briefing: Briefing | null): FormState {
  if (!briefing) return {};
  const form: FormState = {};
  for (const section of BRIEFING_SECTIONS) {
    for (const { key } of section.fields) {
      form[key] = briefing[key] ?? '';
    }
  }
  return form;
}

export default function BriefingPage() {
  const params = useParams<{ id: string }>();
  const leadId = params.id;

  const [lead, setLead] = useState<Lead | null>(null);
  const [form, setForm] = useState<FormState>({});
  const [status, setStatus] = useState<BriefingStatus>('em_andamento');
  const [loading, setLoading] = useState(true);
  const [savingField, setSavingField] = useState<SavingKey | null>(null);
  const [completing, setCompleting] = useState(false);
  const [numeroAgendas, setNumeroAgendas] = useState('');
  const [numeroFluxosAutomacao, setNumeroFluxosAutomacao] = useState('');
  const [integracoesDesejadas, setIntegracoesDesejadas] = useState<IntegracaoDesejada[]>([]);
  const [transcript, setTranscript] = useState('');
  const [extracting, setExtracting] = useState(false);
  const [extractError, setExtractError] = useState('');
  const [aiFilledFields, setAiFilledFields] = useState<Set<BriefingField>>(new Set());
  const [savingAll, setSavingAll] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const supabase = createSupabaseBrowserClient();
    const [{ data: leadData }, briefingResult] = await Promise.all([
      supabase.from('leads').select('*').eq('id', leadId).single(),
      getBriefing(leadId),
    ]);
    setLead(leadData ?? null);
    setForm(briefingToForm(briefingResult.data ?? null));
    setStatus(briefingResult.data?.status ?? 'em_andamento');
    setNumeroAgendas(briefingResult.data?.numero_agendas?.toString() ?? '');
    setNumeroFluxosAutomacao(briefingResult.data?.numero_fluxos_automacao?.toString() ?? '');
    setIntegracoesDesejadas(briefingResult.data?.integracoes_desejadas ?? []);
    setLoading(false);
  }, [leadId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleChange = (field: BriefingField) => (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    setAiFilledFields((prev) => {
      if (!prev.has(field)) return prev;
      const next = new Set(prev);
      next.delete(field);
      return next;
    });
  };

  const handleBlur = (field: BriefingField) => async () => {
    setSavingField(field);
    await upsertBriefingField(leadId, field, form[field] ?? '');
    setSavingField(null);
  };

  const handleComplete = async () => {
    setCompleting(true);
    const { data } = await completeBriefing(leadId);
    if (data) setStatus(data.status);
    setCompleting(false);
  };

  const handleExtractFromTranscript = async () => {
    setExtracting(true);
    setExtractError('');
    try {
      const res = await fetch('/api/briefing/extract-from-transcript', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript, lead_id: leadId }),
      });
      const body = await res.json();
      if (!res.ok) {
        setExtractError(body.error ?? 'Erro ao processar transcrição.');
        return;
      }
      const extracted = body.data as Record<BriefingField, string>;
      const filled = new Set<BriefingField>();
      setForm((prev) => {
        const next = { ...prev };
        for (const section of BRIEFING_SECTIONS) {
          for (const { key } of section.fields) {
            const value = extracted[key];
            if (value && value.trim()) {
              next[key] = value;
              filled.add(key);
            }
          }
        }
        return next;
      });
      setAiFilledFields(filled);
    } catch {
      setExtractError('Erro ao processar transcrição.');
    } finally {
      setExtracting(false);
    }
  };

  const handleSaveAll = async () => {
    setSavingAll(true);
    await Promise.all(
      Array.from(aiFilledFields).map((field) => upsertBriefingField(leadId, field, form[field] ?? ''))
    );
    setAiFilledFields(new Set());
    setSavingAll(false);
  };

  const handleNumberBlur = (field: 'numero_agendas' | 'numero_fluxos_automacao', raw: string) => async () => {
    setSavingField(field);
    const value = raw.trim() === '' ? null : parseInt(raw, 10);
    await upsertBriefingNumberField(leadId, field, Number.isNaN(value) ? null : value);
    setSavingField(null);
  };

  const handleToggleIntegracao = async (value: IntegracaoDesejada) => {
    const next = integracoesDesejadas.includes(value)
      ? integracoesDesejadas.filter((v) => v !== value)
      : [...integracoesDesejadas, value];
    setIntegracoesDesejadas(next);
    setSavingField('integracoes_desejadas');
    await upsertBriefingIntegracoes(leadId, next);
    setSavingField(null);
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
          className="inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-widest text-muted hover:text-primary transition-colors mb-4"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Voltar para Leads
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="font-outfit text-3xl font-black tracking-tight text-primary">
              Briefing
            </h1>
            <p className="text-muted text-sm mt-1">
              {lead?.company_name || 'Lead não encontrado'}
            </p>
          </div>
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[9px] font-black uppercase tracking-widest whitespace-nowrap ${
              status === 'concluido'
                ? 'bg-green-500/15 text-green-400 border-green-500/20'
                : 'bg-yellow-500/15 text-yellow-400 border-yellow-500/20'
            }`}
          >
            {status === 'concluido' ? 'Concluído' : 'Em Andamento'}
          </span>
        </div>
      </div>

      {/* Preenchimento por IA */}
      <div className="bg-surface border border-border rounded-2xl p-6 mb-5">
        <p className="text-[9px] font-black uppercase tracking-widest text-muted mb-3">
          Colar transcrição da reunião (Tactiq)
        </p>
        <textarea
          className={TEXTAREA}
          style={{ minHeight: '180px' }}
          value={transcript}
          onChange={(e) => setTranscript(e.target.value)}
          placeholder="Cole aqui a transcrição gerada pelo Tactiq..."
          rows={8}
        />
        {extractError && (
          <p className="text-xs text-red-400 mt-2">{extractError}</p>
        )}
        <div className="mt-3">
          <button
            onClick={handleExtractFromTranscript}
            disabled={!transcript.trim() || extracting}
            className="relative group disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl blur opacity-30 group-hover:opacity-60 transition duration-300" />
            <div className="relative flex items-center justify-center gap-2 bg-white text-black px-5 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all hover:scale-[1.01] active:scale-[0.99]">
              <Sparkles className="w-3.5 h-3.5" />
              {extracting ? 'Analisando transcrição...' : 'Preencher com IA'}
            </div>
          </button>
        </div>
      </div>

      {/* Salvar Tudo (aparece após preenchimento por IA) */}
      {aiFilledFields.size > 0 && (
        <div className="flex items-center justify-between gap-3 mb-5 px-4 py-3 rounded-xl bg-cyan-500/10 border border-cyan-400/20">
          <p className="text-[11px] font-black uppercase tracking-widest text-cyan-400 flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5" />
            {aiFilledFields.size} campo{aiFilledFields.size !== 1 ? 's' : ''} preenchido{aiFilledFields.size !== 1 ? 's' : ''} pela IA — revise antes de salvar
          </p>
          <button
            onClick={handleSaveAll}
            disabled={savingAll}
            className="shrink-0 px-4 py-2 rounded-xl bg-white text-black text-[11px] font-black uppercase tracking-widest transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60"
          >
            {savingAll ? 'Salvando...' : 'Salvar Tudo'}
          </button>
        </div>
      )}

      {/* Sections */}
      <div className="space-y-5">
        {BRIEFING_SECTIONS.map((section) => (
          <div
            key={section.title}
            className="bg-surface border border-border rounded-2xl p-6"
          >
            <p className="text-[9px] font-black uppercase tracking-widest text-muted mb-5">
              {section.title}
            </p>
            <div className="space-y-4">
              {section.fields.map(({ key, label }) => (
                <div key={key}>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className={`${LABEL} flex items-center gap-1.5 mb-0`}>
                      {label}
                      {aiFilledFields.has(key) && (
                        <Sparkles className="w-3 h-3 text-cyan-400" />
                      )}
                    </label>
                    {savingField === key && (
                      <span className="text-[9px] font-black uppercase tracking-widest text-muted">
                        Salvando...
                      </span>
                    )}
                  </div>
                  <textarea
                    className={aiFilledFields.has(key) ? TEXTAREA_AI_FILLED : TEXTAREA}
                    value={form[key] ?? ''}
                    onChange={handleChange(key)}
                    onBlur={handleBlur(key)}
                    rows={3}
                  />
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Dados para Precificação */}
        <div className="bg-surface border border-border rounded-2xl p-6">
          <p className="text-[9px] font-black uppercase tracking-widest text-muted mb-5">
            Dados para Precificação
          </p>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className={LABEL}>Número de agendas</label>
                  {savingField === 'numero_agendas' && (
                    <span className="text-[9px] font-black uppercase tracking-widest text-muted">
                      Salvando...
                    </span>
                  )}
                </div>
                <input
                  type="number"
                  className={INPUT}
                  value={numeroAgendas}
                  onChange={(e) => setNumeroAgendas(e.target.value)}
                  onBlur={handleNumberBlur('numero_agendas', numeroAgendas)}
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className={LABEL}>Número de fluxos de automação</label>
                  {savingField === 'numero_fluxos_automacao' && (
                    <span className="text-[9px] font-black uppercase tracking-widest text-muted">
                      Salvando...
                    </span>
                  )}
                </div>
                <input
                  type="number"
                  className={INPUT}
                  value={numeroFluxosAutomacao}
                  onChange={(e) => setNumeroFluxosAutomacao(e.target.value)}
                  onBlur={handleNumberBlur('numero_fluxos_automacao', numeroFluxosAutomacao)}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className={LABEL}>Integrações desejadas</label>
                {savingField === 'integracoes_desejadas' && (
                  <span className="text-[9px] font-black uppercase tracking-widest text-muted">
                    Salvando...
                  </span>
                )}
              </div>
              <div className="space-y-2">
                {INTEGRACAO_OPTIONS.map(({ value, label }) => (
                  <label
                    key={value}
                    className="flex items-center gap-2.5 text-sm text-secondary cursor-pointer select-none"
                  >
                    <input
                      type="checkbox"
                      checked={integracoesDesejadas.includes(value)}
                      onChange={() => handleToggleIntegracao(value)}
                      className="w-4 h-4 rounded border-border-strong bg-inset accent-cyan-500"
                    />
                    {label}
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Complete button */}
      <div className="mt-6">
        <button
          onClick={handleComplete}
          disabled={completing || status === 'concluido'}
          className="relative group disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {status !== 'concluido' && (
            <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl blur opacity-30 group-hover:opacity-60 transition duration-300" />
          )}
          <div className="relative flex items-center justify-center gap-2 bg-white text-black px-6 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all hover:scale-[1.01] active:scale-[0.99]">
            <CheckCircle2 className="w-3.5 h-3.5" />
            {status === 'concluido' ? 'Briefing Concluído' : completing ? 'Salvando...' : 'Marcar como Concluído'}
          </div>
        </button>
      </div>
    </div>
  );
}
