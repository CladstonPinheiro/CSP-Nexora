'use client';

import { useState, useEffect } from 'react';
import { X, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { createSupabaseBrowserClient } from '@/lib/supabase';
import Link from 'next/link';

type Projeto = {
  id: string;
  title: string | null;
  scope: string | null;
  status: string | null;
  client_id: string | null;
  setup_value: number | null;
  monthly_value: number | null;
  start_date: string | null;
  delivery_date: string | null;
  notes: string | null;
  created_at: string;
};

type ClienteRef = {
  id: string;
  company_name: string | null;
};

const statusConfig: Record<string, { label: string; style: string }> = {
  ativo:     { label: 'Ativo',     style: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20' },
  pausado:   { label: 'Pausado',   style: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/20' },
  concluido: { label: 'Concluído', style: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/20' },
  cancelado: { label: 'Cancelado', style: 'bg-red-500/15 text-red-400 border-red-500/20' },
};

interface ProjetoPanelProps {
  projeto: Projeto | null;
  onClose: () => void;
}

function Detail({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <p className="text-[9px] font-black uppercase tracking-widest text-muted mb-1">{label}</p>
      <p className="text-sm text-secondary">{value || '—'}</p>
    </div>
  );
}

function formatCurrency(value: number | null) {
  if (!value) return '—';
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
}

export function ProjetoPanel({ projeto, onClose }: ProjetoPanelProps) {
  const [cliente, setCliente] = useState<ClienteRef | null>(null);

  useEffect(() => {
    if (!projeto?.client_id) {
      setCliente(null);
      return;
    }
    const supabase = createSupabaseBrowserClient();
    supabase
      .from('clientes')
      .select('id, company_name')
      .eq('id', projeto.client_id)
      .single()
      .then(({ data }) => setCliente(data ?? null));
  }, [projeto?.client_id]);

  const statusCfg = projeto?.status ? statusConfig[projeto.status] : null;

  return (
    <AnimatePresence>
      {projeto && (
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
                  {projeto.title || 'Projeto sem título'}
                </p>
                {statusCfg && (
                  <span className={`inline-flex mt-1.5 px-2 py-0.5 rounded-lg border text-[9px] font-black uppercase tracking-widest ${statusCfg.style}`}>
                    {statusCfg.label}
                  </span>
                )}
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 border border-border flex items-center justify-center text-muted hover:text-primary transition-all shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              {/* Cliente vinculado */}
              {cliente && (
                <div className="px-6 py-5 border-b border-border">
                  <p className="text-[9px] font-black uppercase tracking-widest text-muted mb-3">
                    Cliente
                  </p>
                  <Link
                    href={`/admin/clientes?clienteId=${projeto.client_id}`}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/[0.03] border border-border hover:bg-white/[0.06] hover:border-border-strong transition-all group"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-primary truncate">
                        {cliente.company_name || 'Empresa não informada'}
                      </p>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-muted group-hover:text-secondary shrink-0 transition-colors" />
                  </Link>
                </div>
              )}

              {/* Financeiro */}
              <div className="px-6 py-5 border-b border-border">
                <p className="text-[9px] font-black uppercase tracking-widest text-muted mb-4">
                  Financeiro
                </p>
                <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                  <Detail label="Setup" value={formatCurrency(projeto.setup_value)} />
                  <Detail label="Mensalidade" value={formatCurrency(projeto.monthly_value)} />
                  <Detail label="Início" value={projeto.start_date ? formatDate(projeto.start_date) : null} />
                  <Detail label="Entrega" value={projeto.delivery_date ? formatDate(projeto.delivery_date) : null} />
                </div>
              </div>

              {/* Escopo e notas */}
              {(projeto.scope || projeto.notes) && (
                <div className="px-6 py-5 space-y-4">
                  {projeto.scope && (
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-widest text-muted mb-2">Escopo</p>
                      <p className="text-sm text-secondary leading-relaxed">{projeto.scope}</p>
                    </div>
                  )}
                  {projeto.notes && (
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-widest text-muted mb-2">Notas</p>
                      <p className="text-sm text-secondary leading-relaxed bg-white/[0.03] border border-border rounded-xl p-4 whitespace-pre-wrap">
                        {projeto.notes}
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
