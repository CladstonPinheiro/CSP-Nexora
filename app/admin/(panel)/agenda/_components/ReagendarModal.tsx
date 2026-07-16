'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { reagendarAgendamento, buscarHorariosDisponiveis } from '../actions';
import type { Agendamento } from './types';

interface ReagendarModalProps {
  target: Agendamento | null;
  onClose: () => void;
  onSuccess: (agendamento: Agendamento) => void;
}

const INPUT =
  'w-full bg-inset border border-border rounded-xl px-4 py-2.5 text-primary text-sm placeholder-gray-700 focus:outline-none focus:border-border-strong transition-all disabled:opacity-50';
const LABEL = 'block text-[10px] font-black uppercase tracking-widest text-secondary mb-1.5';

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className={LABEL}>{label}</label>
      {children}
    </div>
  );
}

function hojeSP() {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo' }).format(new Date());
}
function paraSaoPauloData(iso: string) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo' }).format(new Date(iso));
}
function paraSaoPauloHora(iso: string) {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: 'America/Sao_Paulo',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date(iso));
}

export function ReagendarModal({ target, onClose, onSuccess }: ReagendarModalProps) {
  const [data, setData] = useState('');
  const [hora, setHora] = useState('');
  const [slots, setSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sugestoes, setSugestoes] = useState<string[]>([]);

  useEffect(() => {
    if (target) {
      setData(paraSaoPauloData(target.data_hora_inicio));
      setHora(paraSaoPauloHora(target.data_hora_inicio));
      setError('');
      setSugestoes([]);
    }
  }, [target]);

  useEffect(() => {
    if (!data || !target) return;
    let cancelado = false;
    setLoadingSlots(true);
    buscarHorariosDisponiveis(data).then((res) => {
      if (cancelado) return;
      let disponiveis = res.slots ?? [];
      // O horário atual do próprio agendamento sendo reagendado aparece como
      // "ocupado" na consulta genérica de horários (ela não sabe que é o
      // mesmo agendamento) — reinclui para permitir manter o mesmo horário.
      if (paraSaoPauloData(target.data_hora_inicio) === data) {
        const atual = paraSaoPauloHora(target.data_hora_inicio);
        if (!disponiveis.includes(atual)) {
          disponiveis = [...disponiveis, atual].sort();
        }
      }
      setSlots(disponiveis);
      if (res.error) setError(res.error);
      setLoadingSlots(false);
    });
    return () => {
      cancelado = true;
    };
  }, [data, target]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!target || !data || !hora) return;
    setError('');
    setSugestoes([]);
    setLoading(true);

    const res = await reagendarAgendamento(target.id, { data, hora });

    if (res.error) {
      setError(res.error);
      setSugestoes(res.sugestoes ?? []);
      setLoading(false);
      return;
    }

    onSuccess({ ...target, ...(res.data as Partial<Agendamento>) } as Agendamento);
    setLoading(false);
  };

  return (
    <AnimatePresence>
      {target && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 10 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="w-full max-w-md bg-surface border border-border rounded-2xl shadow-2xl pointer-events-auto max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between px-6 py-5 border-b border-border">
                <div>
                  <h3 className="font-outfit text-lg font-black text-primary">Reagendar</h3>
                  <p className="text-xs text-muted mt-0.5">{target.leads?.company_name || 'Lead'}</p>
                </div>
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 border border-border flex items-center justify-center text-muted hover:text-primary transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
                <Field label="Nova data">
                  <input
                    type="date"
                    value={data}
                    min={hojeSP()}
                    onChange={(e) => setData(e.target.value)}
                    className={INPUT}
                    required
                  />
                </Field>

                <Field label="Novo horário">
                  <select
                    value={hora}
                    onChange={(e) => setHora(e.target.value)}
                    className={INPUT}
                    required
                    disabled={!data || loadingSlots}
                  >
                    <option value="">
                      {loadingSlots
                        ? 'Carregando horários...'
                        : slots.length === 0
                        ? 'Sem horários disponíveis nesse dia'
                        : 'Selecione um horário'}
                    </option>
                    {slots.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </Field>

                {error && (
                  <div className="px-3 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold">
                    {error}
                    {sugestoes.length > 0 && (
                      <p className="mt-1 text-red-400/80 font-normal">
                        Horários livres nesse dia: {sugestoes.map((s) => s.slice(11, 16)).join(', ')}
                      </p>
                    )}
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={loading}
                    className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 border border-border text-secondary text-[11px] font-black uppercase tracking-widest hover:bg-white/10 hover:text-primary transition-all disabled:opacity-60"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={loading || !data || !hora}
                    className="flex-1 relative group disabled:opacity-50"
                  >
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl blur opacity-40 group-hover:opacity-70 transition duration-300" />
                    <div className="relative flex items-center justify-center bg-white text-black py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all">
                      {loading ? 'Reagendando...' : 'Confirmar Reagendamento'}
                    </div>
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
