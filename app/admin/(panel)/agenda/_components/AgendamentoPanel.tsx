'use client';

import { X, CalendarClock, Ban } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { statusConfig, type Agendamento } from './types';

interface AgendamentoPanelProps {
  agendamento: Agendamento | null;
  onClose: () => void;
  onReagendar: (agendamento: Agendamento) => void;
  onCancelar: (agendamento: Agendamento) => void;
}

function formatarDataHora(iso: string) {
  const d = new Date(iso);
  const data = d.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    timeZone: 'America/Sao_Paulo',
  });
  const hora = d.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'America/Sao_Paulo',
  });
  return `${data} às ${hora}`;
}

export function AgendamentoPanel({ agendamento, onClose, onReagendar, onCancelar }: AgendamentoPanelProps) {
  const bloqueado = agendamento?.status === 'cancelado';

  return (
    <AnimatePresence>
      {agendamento && (
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
            className="fixed right-0 top-0 h-screen w-full sm:w-[400px] z-50 bg-surface border-l border-border flex flex-col shadow-2xl"
          >
            <div className="flex items-start justify-between px-6 py-5 border-b border-border shrink-0">
              <div className="flex-1 min-w-0 pr-3">
                <p className="font-outfit text-lg font-black tracking-tight text-primary truncate">
                  {agendamento.leads?.company_name || 'Empresa não informada'}
                </p>
                <p className="text-sm text-muted truncate mt-0.5">{agendamento.leads?.contact_name || '—'}</p>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 border border-border flex items-center justify-center text-muted hover:text-primary transition-all shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
              <span
                className={`inline-flex px-2 py-1 rounded-lg border text-[9px] font-black uppercase tracking-widest ${statusConfig[agendamento.status].style}`}
              >
                {statusConfig[agendamento.status].label}
              </span>

              <div>
                <p className="text-[9px] font-black uppercase tracking-widest text-muted mb-1">
                  Data e horário
                </p>
                <p className="text-sm text-secondary">{formatarDataHora(agendamento.data_hora_inicio)}</p>
              </div>

              <div>
                <p className="text-[9px] font-black uppercase tracking-widest text-muted mb-1">Assunto</p>
                <p className="text-sm text-secondary">{agendamento.assunto || '—'}</p>
              </div>

              {agendamento.leads?.phone && (
                <div>
                  <p className="text-[9px] font-black uppercase tracking-widest text-muted mb-1">Telefone</p>
                  <p className="text-sm text-secondary">{agendamento.leads.phone}</p>
                </div>
              )}

              <div className="pt-2 space-y-2">
                <button
                  onClick={() => onReagendar(agendamento)}
                  disabled={bloqueado}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-border hover:border-border-strong text-secondary hover:text-primary text-[11px] font-black uppercase tracking-widest transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white/5"
                >
                  <CalendarClock className="w-3.5 h-3.5" />
                  Reagendar
                </button>
                <button
                  onClick={() => onCancelar(agendamento)}
                  disabled={bloqueado}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-500/5 hover:bg-red-500/10 border border-red-500/10 hover:border-red-500/20 text-red-500 text-[11px] font-black uppercase tracking-widest transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-red-500/5"
                >
                  <Ban className="w-3.5 h-3.5" />
                  Cancelar
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
