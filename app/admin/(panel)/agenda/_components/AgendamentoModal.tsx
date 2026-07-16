'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { criarAgendamento, buscarHorariosDisponiveis } from '../actions';
import { LeadSelect } from './LeadSelect';
import type { Agendamento, LeadOption } from './types';

interface AgendamentoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (agendamento: Agendamento) => void;
  dataInicial?: string;
  horaInicial?: string;
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

export function AgendamentoModal({ isOpen, onClose, onSuccess, dataInicial, horaInicial }: AgendamentoModalProps) {
  const [lead, setLead] = useState<LeadOption | null>(null);
  const [data, setData] = useState('');
  const [hora, setHora] = useState('');
  const [assunto, setAssunto] = useState('');
  const [slots, setSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sugestoes, setSugestoes] = useState<string[]>([]);

  useEffect(() => {
    if (isOpen) {
      setLead(null);
      setData(dataInicial ?? '');
      setHora('');
      setAssunto('');
      setSlots([]);
      setError('');
      setSugestoes([]);
    }
  }, [isOpen, dataInicial]);

  useEffect(() => {
    if (!data) {
      setSlots([]);
      return;
    }
    let cancelado = false;
    setLoadingSlots(true);
    buscarHorariosDisponiveis(data).then((res) => {
      if (cancelado) return;
      const disponiveis = res.slots ?? [];
      setSlots(disponiveis);
      if (res.error) setError(res.error);
      setHora(horaInicial && disponiveis.includes(horaInicial) ? horaInicial : '');
      setLoadingSlots(false);
    });
    return () => {
      cancelado = true;
    };
    // horaInicial só é aplicado na primeira checagem da data pré-preenchida
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lead || !data || !hora) return;
    setError('');
    setSugestoes([]);
    setLoading(true);

    const res = await criarAgendamento({
      lead_id: lead.id,
      assunto: assunto || null,
      data,
      hora,
    });

    if (res.error) {
      setError(res.error);
      setSugestoes(res.sugestoes ?? []);
      setLoading(false);
      return;
    }

    onSuccess({
      ...(res.data as Omit<Agendamento, 'leads'>),
      leads: { company_name: lead.company_name, contact_name: lead.contact_name, phone: lead.phone },
    } as Agendamento);
    setLoading(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
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
                <h3 className="font-outfit text-lg font-black text-primary">Novo Agendamento</h3>
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 border border-border flex items-center justify-center text-muted hover:text-primary transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
                <Field label="Lead">
                  <LeadSelect value={lead} onChange={setLead} />
                </Field>

                <Field label="Data">
                  <input
                    type="date"
                    value={data}
                    min={hojeSP()}
                    onChange={(e) => setData(e.target.value)}
                    className={INPUT}
                    required
                  />
                </Field>

                <Field label="Horário">
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
                        : !data
                        ? 'Selecione uma data primeiro'
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

                <Field label="Assunto">
                  <input
                    type="text"
                    value={assunto}
                    onChange={(e) => setAssunto(e.target.value)}
                    placeholder="Ex: Reunião de Briefing"
                    className={INPUT}
                  />
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
                    disabled={loading || !lead || !data || !hora}
                    className="flex-1 relative group disabled:opacity-50"
                  >
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl blur opacity-40 group-hover:opacity-70 transition duration-300" />
                    <div className="relative flex items-center justify-center bg-white text-black py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all">
                      {loading ? 'Agendando...' : 'Agendar'}
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
