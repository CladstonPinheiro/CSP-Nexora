'use client';

import { useState, useEffect } from 'react';
import { X, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { createSupabaseBrowserClient } from '@/lib/supabase';
import Link from 'next/link';

type Cliente = {
  id: string;
  lead_id: string | null;
  company_name: string | null;
  contact_name: string | null;
  phone: string | null;
  email: string | null;
  niche: string | null;
  status: string | null;
  started_at: string | null;
};

type LeadOrigin = {
  id: string;
  company_name: string | null;
  contact_name: string | null;
};

type ProjetoVinculado = {
  id: string;
  title: string | null;
  status: string | null;
};

const statusConfig: Record<string, { label: string; style: string }> = {
  ativo:     { label: 'Ativo',     style: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20' },
  pausado:   { label: 'Pausado',   style: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/20' },
  encerrado: { label: 'Encerrado', style: 'bg-red-500/15 text-red-400 border-red-500/20' },
};

const nichoLabel: Record<string, string> = {
  saude:       'Saúde',
  educacao:    'Educação',
  tecnologia:  'Tecnologia',
  varejo:      'Varejo',
  servicos:    'Serviços',
  industria:   'Indústria',
  imobiliario: 'Imobiliário',
  juridico:    'Jurídico',
  outros:      'Outros',
};

interface ClientePanelProps {
  cliente: Cliente | null;
  onClose: () => void;
}

function Detail({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <p className="text-[9px] font-black uppercase tracking-widest text-muted mb-1">{label}</p>
      <p className="text-sm text-secondary truncate">{value || '—'}</p>
    </div>
  );
}

const projetoStatusConfig: Record<string, { label: string; style: string }> = {
  ativo:     { label: 'Ativo',     style: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20' },
  pausado:   { label: 'Pausado',   style: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/20' },
  concluido: { label: 'Concluído', style: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/20' },
  cancelado: { label: 'Cancelado', style: 'bg-red-500/15 text-red-400 border-red-500/20' },
};

export function ClientePanel({ cliente, onClose }: ClientePanelProps) {
  const [leadOrigin, setLeadOrigin] = useState<LeadOrigin | null>(null);
  const [projetos, setProjetos] = useState<ProjetoVinculado[]>([]);

  useEffect(() => {
    if (!cliente?.lead_id) {
      setLeadOrigin(null);
      return;
    }
    const supabase = createSupabaseBrowserClient();
    supabase
      .from('leads')
      .select('id, company_name, contact_name')
      .eq('id', cliente.lead_id)
      .single()
      .then(({ data }) => setLeadOrigin(data ?? null));
  }, [cliente?.lead_id]);

  useEffect(() => {
    if (!cliente?.id) {
      setProjetos([]);
      return;
    }
    const supabase = createSupabaseBrowserClient();
    supabase
      .from('projetos')
      .select('id, title, status')
      .eq('client_id', cliente.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => setProjetos(data ?? []));
  }, [cliente?.id]);

  const statusCfg = cliente?.status ? statusConfig[cliente.status] : null;

  return (
    <AnimatePresence>
      {cliente && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-40 bg-black/40"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 220 }}
            className="fixed right-0 top-0 h-screen w-[400px] z-50 bg-surface border-l border-border flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-start justify-between px-6 py-5 border-b border-border shrink-0">
              <div className="flex-1 min-w-0 pr-3">
                <p className="font-outfit text-lg font-black tracking-tight text-primary truncate">
                  {cliente.company_name || 'Empresa não informada'}
                </p>
                <p className="text-sm text-muted truncate mt-0.5">{cliente.contact_name || '—'}</p>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 border border-border flex items-center justify-center text-muted hover:text-primary transition-all shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              {/* Lead de origem */}
              {leadOrigin && (
                <div className="px-6 py-5 border-b border-border">
                  <p className="text-[9px] font-black uppercase tracking-widest text-muted mb-3">
                    Origem
                  </p>
                  <Link
                    href={`/admin/leads?leadId=${cliente.lead_id}`}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/[0.03] border border-border hover:bg-white/[0.06] hover:border-border-strong transition-all group"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-[9px] font-black uppercase tracking-widest text-muted mb-0.5">
                        Veio do lead
                      </p>
                      <p className="text-sm font-bold text-primary truncate">
                        {leadOrigin.company_name || leadOrigin.contact_name || 'Lead sem nome'}
                      </p>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-muted group-hover:text-secondary shrink-0 transition-colors" />
                  </Link>
                </div>
              )}

              {/* Detalhes */}
              <div className="px-6 py-5 space-y-5">
                <p className="text-[9px] font-black uppercase tracking-widest text-muted">
                  Informações do Cliente
                </p>

                <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                  <Detail label="Telefone" value={cliente.phone} />
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-widest text-muted mb-1">Email</p>
                    {cliente.email ? (
                      <a
                        href={`mailto:${cliente.email}`}
                        className="text-sm text-cyan-400 hover:text-cyan-300 truncate block transition-colors"
                      >
                        {cliente.email}
                      </a>
                    ) : (
                      <p className="text-sm text-muted">—</p>
                    )}
                  </div>
                  <Detail
                    label="Nicho"
                    value={cliente.niche ? (nichoLabel[cliente.niche] ?? cliente.niche) : null}
                  />
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-widest text-muted mb-1">Status</p>
                    {statusCfg ? (
                      <span className={`inline-flex px-2 py-1 rounded-lg border text-[9px] font-black uppercase tracking-widest ${statusCfg.style}`}>
                        {statusCfg.label}
                      </span>
                    ) : (
                      <p className="text-sm text-muted">—</p>
                    )}
                  </div>
                  {cliente.started_at && (
                    <div className="col-span-2">
                      <p className="text-[9px] font-black uppercase tracking-widest text-muted mb-1">
                        Cliente desde
                      </p>
                      <p className="text-sm text-muted">
                        {new Date(cliente.started_at).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Projetos vinculados */}
              <div className="px-6 py-5 border-t border-border">
                <p className="text-[9px] font-black uppercase tracking-widest text-muted mb-3">
                  Projetos{projetos.length > 0 && <span className="ml-2 text-muted">({projetos.length})</span>}
                </p>
                {projetos.length === 0 ? (
                  <p className="text-xs text-muted">Nenhum projeto vinculado</p>
                ) : (
                  <div className="space-y-2">
                    {projetos.map(p => {
                      const cfg = p.status ? projetoStatusConfig[p.status] : null;
                      return (
                        <Link
                          key={p.id}
                          href={`/admin/projetos?projetoId=${p.id}`}
                          className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/[0.03] border border-border hover:bg-white/[0.06] hover:border-border-strong transition-all group"
                        >
                          <p className="flex-1 text-sm font-bold text-primary truncate">
                            {p.title || 'Projeto sem título'}
                          </p>
                          {cfg && (
                            <span className={`inline-flex px-1.5 py-0.5 rounded-md border text-[8px] font-black uppercase tracking-widest shrink-0 ${cfg.style}`}>
                              {cfg.label}
                            </span>
                          )}
                          <ExternalLink className="w-3.5 h-3.5 text-muted group-hover:text-secondary shrink-0 transition-colors" />
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
