'use client';

import { useState, useEffect } from 'react';
import { X, ChevronRight, AlertTriangle, ExternalLink, MessageCircle, Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { createSupabaseBrowserClient } from '@/lib/supabase';
import { cn } from '@/lib/utils';
import {
  FUNIL_GMN,
  FUNIL_PADRAO,
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

type Notification = { type: 'success' | 'warning' | 'info'; message: string };

export function LeadPanel({ lead, onClose, onUpdate }: LeadPanelProps) {
  const [updating, setUpdating] = useState(false);
  const [notification, setNotification] = useState<Notification | null>(null);

  useEffect(() => {
    if (!notification) return;
    const t = setTimeout(() => setNotification(null), 4000);
    return () => clearTimeout(t);
  }, [notification]);

  const rawPhone = lead?.phone;
  const phoneDigits = rawPhone?.replace(/\D/g, '') ?? '';
  const canSendProposal = !!(phoneDigits && lead?.site_demo);

  const canSendReminder = !!(phoneDigits && lead?.site_demo && lead?.stage !== 'fechado');

  const buildReminderUrl = () => {
    const mensagem = encodeURIComponent(
      `Oi, ${lead?.company_name}! Tudo bem? 👋\n\nPassando para avisar que o site que criamos especialmente para ${lead?.company_name} ficará disponível apenas até este domingo.\n\n👉 ${lead?.site_demo}\n\nDepois disso o endereço sai do ar e precisaríamos recriar tudo do zero caso queira seguir em frente.\n\nSe tiver interesse em garantir o site ou tirar qualquer dúvida antes disso, é só responder aqui — consigo encaixar um horário ainda essa semana. 😊\n\nQualquer coisa estou à disposição!\nCladston | CSP Nexora`
    );
    return `https://wa.me/55${phoneDigits}?text=${mensagem}`;
  };

  const buildWhatsAppUrl = () => {
    const mensagem = encodeURIComponent(
      `Oi! Tudo bem? 👋\n\nVi o cadastro da *${lead?.company_name}* no Google Meu Negócio e criamos um lindo projeto, um site totalmente atualizado, moderno e com os dados reais do seu negócio.\n\nDá uma olhada: 👉 ${lead?.site_demo}\n⚠️ Este site fica disponível por apenas 48 horas.\n\nEntregamos em 24h com domínio próprio (.com.br), 3 e-mails profissionais, hospedagem com certificado de segurança e suporte — tudo isso por apenas R$ 500 à vista ou 2x de R$ 350, sem mensalidade ou taxas.\n\nMais detalhes: cspnexora.com.br/oferta\n\nQualquer dúvida é só responder aqui. 😊`
    );
    return `https://wa.me/55${phoneDigits}?text=${mensagem}`;
  };

  const isGMN = lead?.source === 'prospeccao_gmn';
  const FUNIL = isGMN ? FUNIL_GMN : FUNIL_PADRAO;

  const currentStageIndex = lead?.stage
    ? FUNIL.indexOf(lead.stage as Estagio)
    : -1;
  const isTerminal = lead?.stage === 'fechado' || lead?.stage === 'perdido';
  const canAdvance =
    lead && currentStageIndex >= 0 && currentStageIndex < FUNIL.length - 1;
  const canMarkLost = lead && !isTerminal;
  const nextStage = canAdvance ? FUNIL[currentStageIndex + 1] : null;

  const handleAdvanceStage = async () => {
    if (!lead || !canAdvance || !nextStage) return;
    setUpdating(true);

    if (nextStage === 'fechado') {
      const res = await fetch(`/api/leads/${lead.id}/close`, { method: 'POST' });
      if (res.ok) {
        const body: { clienteCriado: boolean; motivo?: string } = await res.json();
        onUpdate({ ...lead, stage: 'fechado' });
        if (body.clienteCriado) {
          setNotification({ type: 'success', message: 'Lead fechado. Cliente criado com sucesso.' });
        } else if (body.motivo === 'empresa_nao_preenchida') {
          setNotification({ type: 'warning', message: 'Lead fechado. Crie o cliente manualmente — nome da empresa não preenchido.' });
        } else if (body.motivo === 'ja_convertido') {
          setNotification({ type: 'info', message: 'Lead fechado. Esse lead já era cliente.' });
        }
      }
    } else {
      const supabase = createSupabaseBrowserClient();
      const { data, error } = await supabase
        .from('leads')
        .update({ stage: nextStage })
        .eq('id', lead.id)
        .select()
        .single();
      if (!error && data) onUpdate(data as Lead);
    }

    setUpdating(false);
  };

  const handleMarkLost = async () => {
    if (!lead || !canMarkLost) return;
    setUpdating(true);
    const supabase = createSupabaseBrowserClient();
    const { data, error } = await supabase
      .from('leads')
      .update({ stage: 'perdido' })
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
                  {lead.company_name || 'Empresa não informada'}
                </p>
                <p className="text-sm text-gray-500 truncate mt-0.5">{lead.contact_name || '—'}</p>
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
                  {FUNIL.map((stage, i) => {
                    const isCurrent = lead.stage === stage;
                    const isPast = currentStageIndex > i;
                    const cfg = estagioConfig[stage];
                    return (
                      <div
                        key={stage}
                        className={cn(
                          'flex items-center gap-3 px-3 py-2 rounded-xl border transition-all',
                          isCurrent
                            ? 'bg-white/10 border-white/20'
                            : 'border-transparent'
                        )}
                      >
                        <div
                          className={cn(
                            'w-1.5 h-1.5 rounded-full shrink-0',
                            isCurrent ? 'bg-white' : isPast ? 'bg-gray-600' : 'bg-gray-800'
                          )}
                        />
                        <span
                          className={cn(
                            'text-[11px] font-black uppercase tracking-widest',
                            isCurrent
                              ? 'text-white'
                              : isPast
                              ? 'text-gray-600'
                              : 'text-gray-800'
                          )}
                        >
                          {cfg.label}
                        </span>
                        {isCurrent && (
                          <span className="ml-auto flex items-center gap-2">
                            {isGMN && lead.site_demo && (stage === 'identificado' || stage === 'proposta_enviada') && (
                              <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400" />
                              </span>
                            )}
                            <span className="text-[9px] font-black uppercase tracking-widest text-white/50">
                              atual
                            </span>
                          </span>
                        )}
                      </div>
                    );
                  })}

                  {lead.stage === 'perdido' && (
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

                {/* Notification */}
                <AnimatePresence>
                  {notification && (
                    <motion.div
                      key={notification.message}
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.18 }}
                      className={cn(
                        'mt-3 px-3 py-2.5 rounded-xl border text-[11px] font-bold leading-snug',
                        notification.type === 'success' && 'bg-green-500/10 border-green-500/20 text-green-400',
                        notification.type === 'warning' && 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400',
                        notification.type === 'info'    && 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400',
                      )}
                    >
                      {notification.message}
                    </motion.div>
                  )}
                </AnimatePresence>

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
                  {canSendProposal && (
                    <a
                      href={buildWhatsAppUrl()}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-green-500/10 hover:bg-green-500/15 border border-green-500/20 hover:border-green-500/30 text-green-400 text-[11px] font-black uppercase tracking-widest transition-all"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      Enviar Proposta no WhatsApp
                    </a>
                  )}
                  {canSendReminder && (
                    <a
                      href={buildReminderUrl()}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/15 border border-red-500/20 hover:border-red-500/30 text-red-400 text-[11px] font-black uppercase tracking-widest transition-all"
                    >
                      <Bell className="w-3.5 h-3.5" />
                      Enviar Lembrete de Expiração
                    </a>
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
                    value={lead.niche ? (nichoLabel[lead.niche] ?? lead.niche) : null}
                  />
                  <Detail label="Cidade" value={lead.city} />
                  <Detail label="Telefone" value={lead.phone} />
                  <Detail label="Email" value={lead.email} href={lead.email ? `mailto:${lead.email}` : null} />
                  <Detail label="LinkedIn" value={lead.linkedin} href={lead.linkedin} />
                  <Detail label="Instagram" value={lead.instagram} href={lead.instagram ? `https://instagram.com/${lead.instagram.replace('@', '')}` : null} />

                  <div className="col-span-2">
                    <Detail label="Website" value={lead.website} href={lead.website} />
                  </div>

                  {lead.site_demo && (
                    <div className="col-span-2">
                      <Detail label="Site Demo" value={lead.site_demo} href={lead.site_demo} />
                    </div>
                  )}

                  <div>
                    <p className="text-[9px] font-black uppercase tracking-widest text-gray-700 mb-1">
                      Origem
                    </p>
                    {lead.source ? (
                      <span
                        className={`inline-flex px-2 py-1 rounded-lg border text-[9px] font-black uppercase tracking-widest ${origemConfig[lead.source]?.style ?? 'bg-gray-500/15 text-gray-400 border-gray-500/20'}`}
                      >
                        {origemConfig[lead.source]?.label ?? lead.source}
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

                  {lead.referred_by && (
                    <div className="col-span-2">
                      <Detail label="Indicado por" value={lead.referred_by} />
                    </div>
                  )}
                </div>

                {lead.notes && (
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-widest text-gray-700 mb-2">
                      Anotações
                    </p>
                    <p className="text-sm text-gray-400 leading-relaxed bg-white/[0.03] border border-white/5 rounded-xl p-4 whitespace-pre-wrap">
                      {lead.notes}
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

              {/* Qualificação IA */}
              {lead.ai_score && (
                <div className="px-6 py-5 border-t border-white/5 space-y-4">
                  <p className="text-[9px] font-black uppercase tracking-widest text-gray-700">
                    Qualificação IA
                  </p>

                  <div>
                    <p className="text-[9px] font-black uppercase tracking-widest text-gray-700 mb-1">
                      Score
                    </p>
                    <span
                      className={`inline-flex px-2 py-1 rounded-lg border text-[9px] font-black uppercase tracking-widest ${scoreConfig[lead.ai_score]?.style ?? ''}`}
                    >
                      {scoreConfig[lead.ai_score]?.label ?? lead.ai_score}
                    </span>
                  </div>

                  {lead.ai_reasoning && (
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-widest text-gray-700 mb-2">
                        Análise
                      </p>
                      <p className="text-sm text-gray-400 leading-relaxed bg-white/[0.03] border border-white/5 rounded-xl p-4 whitespace-pre-wrap">
                        {lead.ai_reasoning}
                      </p>
                    </div>
                  )}

                  {lead.ai_qualified_at && (
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-widest text-gray-700 mb-1">
                        Qualificado em
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(lead.ai_qualified_at).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: 'long',
                          year: 'numeric',
                        })}{' '}
                        às{' '}
                        {new Date(lead.ai_qualified_at).toLocaleTimeString('pt-BR', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
