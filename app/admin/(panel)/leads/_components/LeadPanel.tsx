'use client';

import { useState } from 'react';
import { X, ChevronRight, AlertTriangle, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { createSupabaseBrowserClient } from '@/lib/supabase';
import { cn } from '@/lib/utils';
import {
  STAGE_ORDER,
  estagioConfig,
  origemConfig,
  nichoLabel,
  scoreConfig,
  type Lead,
  type Estagio,
} from './types';

interface LeadPanelProps {
  lead: Lead | null;
  onClose: () => void;
  onUpdate: (lead: Lead) => void;
}

function Detail({
  label,
  value,
  href,
}: {
  label: string;
  value?: string | null;
  href?: string | null;
}) {
  return (
    <div>
      <p className="text-[9px] font-black uppercase tracking-widest text-gray-700 mb-1">{label}</p>
      {value ? (
        href ? (
          <a
            href={href.startsWith('http') ? href : `https://${href}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-sm text-cyan-400 hover:text-cyan-300 transition-colors truncate"
          >
            {value}
            <ExternalLink className="w-3 h-3 shrink-0" />
          </a>
        ) : (
          <p className="text-sm text-gray-300 truncate">{value}</p>
        )
      ) : (
        <p className="text-sm text-gray-700">—</p>
      )}
    </div>
  );
}

export function LeadPanel({ lead, onClose, onUpdate }: LeadPanelProps) {
  const [updating, setUpdating] = useState(false);

  const currentStageIndex = lead?.estagio
    ? STAGE_ORDER.indexOf(lead.estagio as Estagio)
    : -1;
  const isTerminal = lead?.estagio === 'fechado' || lead?.estagio === 'perdido';
  const canAdvance =
    lead && currentStageIndex >= 0 && currentStageIndex < STAGE_ORDER.length - 1;
  const canMarkLost = lead && !isTerminal;
  const nextStage = canAdvance ? STAGE_ORDER[currentStageIndex + 1] : null;

  const handleAdvanceStage = async () => {
    if (!lead || !canAdvance || !nextStage) return;
    setUpdating(true);
    const supabase = createSupabaseBrowserClient();
    const { data, error } = await supabase
      .from('leads')
      .update({ estagio: nextStage })
      .eq('id', lead.id)
      .select()
      .single();
    if (!error && data) onUpdate(data as Lead);
    setUpdating(false);
  };

  const handleMarkLost = async () => {
    if (!lead || !canMarkLost) return;
    setUpdating(true);
    const supabase = createSupabaseBrowserClient();
    const { data, error } = await supabase
      .from('leads')
      .update({ estagio: 'perdido' })
      .eq('id', lead.id)
      .select()
      .single();
    if (!error && data) onUpdate(data as Lead);
    setUpdating(false);
  };

  return (
    <AnimatePresence>
      {lead && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-40 bg-black/40"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 220 }}
            className="fixed right-0 top-0 h-screen w-[440px] z-50 bg-[#0B0B0B] border-l border-white/10 flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-start justify-between px-6 py-5 border-b border-white/5 shrink-0">
              <div className="flex-1 min-w-0 pr-3">
                <p className="font-outfit text-lg font-black tracking-tight text-white truncate">
                  {lead.empresa || 'Empresa não informada'}
                </p>
                <p className="text-sm text-gray-500 truncate mt-0.5">{lead.nome || '—'}</p>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-gray-500 hover:text-white transition-all shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              {/* Funil */}
              <div className="px-6 py-5 border-b border-white/5">
                <p className="text-[9px] font-black uppercase tracking-widest text-gray-700 mb-3">
                  Funil de vendas
                </p>

                <div className="space-y-0.5">
                  {STAGE_ORDER.map((stage, i) => {
                    const isCurrent = lead.estagio === stage;
                    const isPast = currentStageIndex > i;
                    const cfg = estagioConfig[stage];
                    return (
                      <div
                        key={stage}
                        className={cn(
                          'flex items-center gap-3 px-3 py-2 rounded-xl border transition-all',
                          isCurrent
                            ? 'bg-cyan-500/10 border-cyan-500/20'
                            : 'border-transparent'
                        )}
                      >
                        <div
                          className={cn(
                            'w-1.5 h-1.5 rounded-full shrink-0',
                            isCurrent ? 'bg-cyan-400' : isPast ? 'bg-gray-600' : 'bg-gray-800'
                          )}
                        />
                        <span
                          className={cn(
                            'text-[11px] font-black uppercase tracking-widest',
                            isCurrent
                              ? 'text-cyan-400'
                              : isPast
                              ? 'text-gray-600'
                              : 'text-gray-800'
                          )}
                        >
                          {cfg.label}
                        </span>
                        {isCurrent && (
                          <span className="ml-auto text-[9px] font-black uppercase tracking-widest text-cyan-500/50">
                            atual
                          </span>
                        )}
                      </div>
                    );
                  })}

                  {lead.estagio === 'perdido' && (
                    <div className="flex items-center gap-3 px-3 py-2 rounded-xl border bg-red-500/10 border-red-500/20">
                      <div className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
                      <span className="text-[11px] font-black uppercase tracking-widest text-red-400">
                        Perdido
                      </span>
                      <span className="ml-auto text-[9px] font-black uppercase tracking-widest text-red-500/50">
                        atual
                      </span>
                    </div>
                  )}
                </div>

                {/* Action buttons */}
                <div className="mt-4 space-y-2">
                  {canAdvance && nextStage && (
                    <button
                      onClick={handleAdvanceStage}
                      disabled={updating}
                      className="w-full relative group disabled:opacity-60"
                    >
                      <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl blur opacity-30 group-hover:opacity-60 transition duration-300" />
                      <div className="relative flex items-center justify-center gap-2 bg-white text-black py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all hover:scale-[1.01] active:scale-[0.99]">
                        {updating ? 'Avançando...' : `Avançar para ${estagioConfig[nextStage]?.label}`}
                        {!updating && <ChevronRight className="w-3.5 h-3.5" />}
                      </div>
                    </button>
                  )}
                  {canMarkLost && (
                    <button
                      onClick={handleMarkLost}
                      disabled={updating}
                      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-500/5 hover:bg-red-500/10 border border-red-500/10 hover:border-red-500/20 text-red-500 text-[11px] font-black uppercase tracking-widest transition-all disabled:opacity-60"
                    >
                      <AlertTriangle className="w-3.5 h-3.5" />
                      Marcar como Perdido
                    </button>
                  )}
                </div>
              </div>

              {/* Details */}
              <div className="px-6 py-5 space-y-5">
                <p className="text-[9px] font-black uppercase tracking-widest text-gray-700">
                  Informações do Lead
                </p>

                <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                  <Detail
                    label="Nicho"
                    value={lead.nicho ? (nichoLabel[lead.nicho] ?? lead.nicho) : null}
                  />
                  <Detail label="Cidade" value={lead.cidade} />
                  <Detail label="Telefone" value={lead.telefone} />
                  <Detail label="Email" value={lead.email} href={lead.email ? `mailto:${lead.email}` : null} />
                  <Detail label="LinkedIn" value={lead.linkedin} href={lead.linkedin} />
                  <Detail label="Instagram" value={lead.instagram} href={lead.instagram ? `https://instagram.com/${lead.instagram.replace('@', '')}` : null} />

                  <div className="col-span-2">
                    <Detail label="Website" value={lead.website} href={lead.website} />
                  </div>

                  <div>
                    <p className="text-[9px] font-black uppercase tracking-widest text-gray-700 mb-1">
                      Origem
                    </p>
                    {lead.origem ? (
                      <span
                        className={`inline-flex px-2 py-1 rounded-lg border text-[9px] font-black uppercase tracking-widest ${origemConfig[lead.origem]?.style ?? 'bg-gray-500/15 text-gray-400 border-gray-500/20'}`}
                      >
                        {origemConfig[lead.origem]?.label ?? lead.origem}
                      </span>
                    ) : (
                      <p className="text-sm text-gray-700">—</p>
                    )}
                  </div>

                  {lead.score && (
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-widest text-gray-700 mb-1">
                        Score
                      </p>
                      <span
                        className={`inline-flex px-2 py-1 rounded-lg border text-[9px] font-black uppercase tracking-widest ${scoreConfig[lead.score]?.style ?? ''}`}
                      >
                        {scoreConfig[lead.score]?.label ?? lead.score}
                      </span>
                    </div>
                  )}

                  {lead.indicado_por && (
                    <div className="col-span-2">
                      <Detail label="Indicado por" value={lead.indicado_por} />
                    </div>
                  )}
                </div>

                {lead.anotacoes && (
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-widest text-gray-700 mb-2">
                      Anotações
                    </p>
                    <p className="text-sm text-gray-400 leading-relaxed bg-white/[0.03] border border-white/5 rounded-xl p-4 whitespace-pre-wrap">
                      {lead.anotacoes}
                    </p>
                  </div>
                )}

                <div>
                  <p className="text-[9px] font-black uppercase tracking-widest text-gray-700 mb-1">
                    Cadastrado em
                  </p>
                  <p className="text-sm text-gray-500">
                    {new Date(lead.created_at).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
