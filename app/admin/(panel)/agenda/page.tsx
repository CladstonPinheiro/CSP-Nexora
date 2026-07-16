'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, List, CalendarDays, SlidersHorizontal, InboxIcon, CalendarClock, Ban, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { createSupabaseBrowserClient } from '@/lib/supabase';
import { cn } from '@/lib/utils';
import { cancelarAgendamento } from './actions';
import { AgendamentoModal } from './_components/AgendamentoModal';
import { ReagendarModal } from './_components/ReagendarModal';
import { AgendamentoPanel } from './_components/AgendamentoPanel';
import { CalendarioFullCalendar } from './_components/CalendarioFullCalendar';
import {
  statusConfig,
  statusGrupoConfig,
  statusGrupoDe,
  type Agendamento,
  type StatusGrupo,
} from './_components/types';

type Visao = 'lista' | 'calendario';
type PeriodoFiltro = 'hoje' | 'semana' | 'todos';
type StatusFiltro = StatusGrupo | 'todos';
type Notification = { type: 'success' | 'error'; message: string };

function hojeSP(): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo' }).format(new Date());
}
function somarDias(data: string, dias: number): string {
  const d = new Date(`${data}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + dias);
  return d.toISOString().slice(0, 10);
}
function segundaDaSemana(data: string): string {
  const dow = new Date(`${data}T00:00:00Z`).getUTCDay();
  const diff = dow === 0 ? -6 : 1 - dow;
  return somarDias(data, diff);
}
function paraSaoPauloData(iso: string): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo' }).format(new Date(iso));
}
function formatarData(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
    timeZone: 'America/Sao_Paulo',
  });
}
function formatarHora(iso: string) {
  return new Date(iso).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'America/Sao_Paulo',
  });
}

const SELECT_CLASS =
  'bg-inset border border-border rounded-xl px-3 py-2 text-secondary text-xs font-bold focus:outline-none focus:border-border-strong transition-all cursor-pointer min-w-[150px]';

export default function AgendaPage() {
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [visao, setVisao] = useState<Visao>('lista');
  const [filtroStatus, setFiltroStatus] = useState<StatusFiltro>('todos');
  const [filtroPeriodo, setFiltroPeriodo] = useState<PeriodoFiltro>('todos');
  const [calendarRefresh, setCalendarRefresh] = useState(0);

  const [modalOpen, setModalOpen] = useState(false);
  const [prefillData, setPrefillData] = useState<string | undefined>(undefined);
  const [prefillHora, setPrefillHora] = useState<string | undefined>(undefined);

  const [selecionado, setSelecionado] = useState<Agendamento | null>(null);
  const [reagendarTarget, setReagendarTarget] = useState<Agendamento | null>(null);
  const [cancelarTarget, setCancelarTarget] = useState<Agendamento | null>(null);
  const [cancelando, setCancelando] = useState(false);

  const [notification, setNotification] = useState<Notification | null>(null);

  useEffect(() => {
    if (!notification) return;
    const t = setTimeout(() => setNotification(null), 4000);
    return () => clearTimeout(t);
  }, [notification]);

  const fetchAgendamentos = useCallback(async () => {
    setLoading(true);
    const supabase = createSupabaseBrowserClient();
    const { data, error } = await supabase
      .from('agendamentos')
      .select('id, lead_id, assunto, data_hora_inicio, data_hora_fim, status, leads(company_name, contact_name, phone)')
      .order('data_hora_inicio', { ascending: true });
    if (!error) setAgendamentos((data ?? []) as unknown as Agendamento[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchAgendamentos();
  }, [fetchAgendamentos]);

  const ordenar = (lista: Agendamento[]) =>
    [...lista].sort((a, b) => a.data_hora_inicio.localeCompare(b.data_hora_inicio));

  const filtrados = ordenar(
    agendamentos.filter((a) => {
      if (filtroStatus !== 'todos' && statusGrupoDe(a.status) !== filtroStatus) return false;
      if (filtroPeriodo === 'hoje' && paraSaoPauloData(a.data_hora_inicio) !== hojeSP()) return false;
      if (filtroPeriodo === 'semana') {
        const seg = segundaDaSemana(hojeSP());
        const dom = somarDias(seg, 6);
        const d = paraSaoPauloData(a.data_hora_inicio);
        if (d < seg || d > dom) return false;
      }
      return true;
    })
  );

  const hasFilters = filtroStatus !== 'todos' || filtroPeriodo !== 'todos';

  const abrirNovoAgendamento = (data?: string, hora?: string) => {
    setPrefillData(data);
    setPrefillHora(hora);
    setModalOpen(true);
  };

  const handleCriado = (novo: Agendamento) => {
    setAgendamentos((prev) => ordenar([...prev, novo]));
    setModalOpen(false);
    setCalendarRefresh((c) => c + 1);
    setNotification({ type: 'success', message: 'Agendamento criado com sucesso.' });
  };

  const handleReagendado = (atualizado: Agendamento) => {
    setAgendamentos((prev) => ordenar(prev.map((a) => (a.id === atualizado.id ? atualizado : a))));
    setReagendarTarget(null);
    if (selecionado?.id === atualizado.id) setSelecionado(null);
    setCalendarRefresh((c) => c + 1);
    setNotification({ type: 'success', message: 'Agendamento reagendado com sucesso.' });
  };

  const handleCancelar = async () => {
    if (!cancelarTarget) return;
    setCancelando(true);
    const res = await cancelarAgendamento(cancelarTarget.id);
    if (res.error) {
      setNotification({ type: 'error', message: res.error });
    } else {
      setAgendamentos((prev) =>
        prev.map((a) => (a.id === cancelarTarget.id ? { ...a, status: 'cancelado' } : a))
      );
      setNotification({ type: 'success', message: 'Agendamento cancelado.' });
      if (selecionado?.id === cancelarTarget.id) setSelecionado(null);
      setCalendarRefresh((c) => c + 1);
    }
    setCancelarTarget(null);
    setCancelando(false);
  };

  return (
    <div className="p-8 min-h-screen">
      {/* Notificação */}
      <AnimatePresence>
        {notification && (
          <motion.div
            key={notification.message}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.18 }}
            className={cn(
              'fixed top-24 right-4 z-[70] px-4 py-3 rounded-xl border text-[12px] font-bold shadow-2xl max-w-sm',
              notification.type === 'success' && 'bg-green-500/10 border-green-500/20 text-green-400',
              notification.type === 'error' && 'bg-red-500/10 border-red-500/20 text-red-400'
            )}
          >
            {notification.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex items-start justify-between mb-6 flex-wrap gap-4">
        <div>
          <h1 className="font-outfit text-3xl font-black tracking-tight text-primary">Agenda</h1>
          <p className="text-muted text-sm mt-1">
            {loading
              ? 'Carregando...'
              : `${filtrados.length}${hasFilters ? ` de ${agendamentos.length}` : ''} agendamento${agendamentos.length !== 1 ? 's' : ''}`}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="inline-flex bg-surface border border-border rounded-xl p-1">
            <button
              onClick={() => setVisao('lista')}
              className={cn(
                'px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-1.5',
                visao === 'lista' ? 'bg-white/10 text-primary' : 'text-muted hover:text-secondary'
              )}
            >
              <List className="w-3.5 h-3.5" />
              Lista
            </button>
            <button
              onClick={() => setVisao('calendario')}
              className={cn(
                'px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-1.5',
                visao === 'calendario' ? 'bg-white/10 text-primary' : 'text-muted hover:text-secondary'
              )}
            >
              <CalendarDays className="w-3.5 h-3.5" />
              Calendário
            </button>
          </div>

          <button onClick={() => abrirNovoAgendamento()} className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl blur opacity-40 group-hover:opacity-70 transition duration-300" />
            <div className="relative flex items-center gap-2 bg-white text-black px-5 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all">
              <Plus className="w-4 h-4" />
              Novo Agendamento
            </div>
          </button>
        </div>
      </div>

      {visao === 'lista' && (
        <>
          {/* Filtros */}
          <div className="flex items-center gap-3 mb-5 flex-wrap">
            <SlidersHorizontal className="w-4 h-4 text-muted shrink-0" />
            <select
              value={filtroStatus}
              onChange={(e) => setFiltroStatus(e.target.value as StatusFiltro)}
              className={SELECT_CLASS}
              style={{ backgroundColor: 'var(--color-inset)' }}
            >
              <option value="todos">Todos os status</option>
              {(Object.keys(statusGrupoConfig) as StatusGrupo[]).map((g) => (
                <option key={g} value={g}>
                  {statusGrupoConfig[g].label}
                </option>
              ))}
            </select>
            <select
              value={filtroPeriodo}
              onChange={(e) => setFiltroPeriodo(e.target.value as PeriodoFiltro)}
              className={SELECT_CLASS}
              style={{ backgroundColor: 'var(--color-inset)' }}
            >
              <option value="todos">Todo o período</option>
              <option value="hoje">Hoje</option>
              <option value="semana">Esta semana</option>
            </select>
            {hasFilters && (
              <button
                onClick={() => {
                  setFiltroStatus('todos');
                  setFiltroPeriodo('todos');
                }}
                className="text-[11px] text-muted hover:text-secondary transition-colors font-black uppercase tracking-widest"
              >
                Limpar filtros
              </button>
            )}
          </div>

          {/* Tabela */}
          <div className="bg-surface border border-border rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[820px]">
                <thead>
                  <tr className="border-b border-border bg-white/[0.015]">
                    {['Data', 'Horário', 'Lead', 'Assunto', 'Status', 'Ações'].map((h) => (
                      <th
                        key={h}
                        className="px-5 py-3.5 text-left text-[9px] font-black uppercase tracking-widest text-muted"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i} className="border-b border-border">
                        {Array.from({ length: 6 }).map((_, j) => (
                          <td key={j} className="px-5 py-4">
                            <div
                              className="h-3 bg-white/5 rounded-lg animate-pulse"
                              style={{ width: `${50 + ((j * 17 + i * 11) % 40)}%` }}
                            />
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : filtrados.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-20">
                        <div className="flex flex-col items-center justify-center text-center">
                          <div className="w-14 h-14 rounded-2xl bg-white/5 border border-border flex items-center justify-center mb-4">
                            <InboxIcon className="w-6 h-6 text-muted" />
                          </div>
                          <p className="text-sm font-bold text-muted">Nenhum agendamento encontrado</p>
                          <p className="text-xs text-muted mt-1">
                            {hasFilters ? 'Tente ajustar os filtros' : 'Crie o primeiro agendamento pelo botão acima'}
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filtrados.map((ag) => {
                      const bloqueado = ag.status === 'cancelado';
                      return (
                        <tr
                          key={ag.id}
                          onClick={() => setSelecionado(ag)}
                          className={cn(
                            'border-b border-border last:border-0 cursor-pointer transition-colors',
                            selecionado?.id === ag.id ? 'bg-cyan-500/[0.04]' : 'hover:bg-white/[0.025]'
                          )}
                        >
                          <td className="px-5 py-4 text-sm text-secondary whitespace-nowrap">
                            {formatarData(ag.data_hora_inicio)}
                          </td>
                          <td className="px-5 py-4 text-sm text-secondary whitespace-nowrap">
                            {formatarHora(ag.data_hora_inicio)}
                          </td>
                          <td className="px-5 py-4">
                            <p className="text-sm font-bold text-primary truncate max-w-[180px]">
                              {ag.leads?.company_name || '—'}
                            </p>
                            <p className="text-xs text-muted truncate max-w-[180px]">{ag.leads?.contact_name || '—'}</p>
                          </td>
                          <td className="px-5 py-4 text-sm text-muted truncate max-w-[200px]">
                            {ag.assunto || '—'}
                          </td>
                          <td className="px-5 py-4">
                            <span
                              className={`inline-flex px-2 py-1 rounded-lg border text-[9px] font-black uppercase tracking-widest whitespace-nowrap ${statusConfig[ag.status].style}`}
                            >
                              {statusConfig[ag.status].label}
                            </span>
                          </td>
                          <td className="px-5 py-4" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => setReagendarTarget(ag)}
                                disabled={bloqueado}
                                className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 border border-border hover:border-border-strong flex items-center justify-center text-muted hover:text-primary transition-all disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-white/5"
                                title="Reagendar"
                              >
                                <CalendarClock className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() => setCancelarTarget(ag)}
                                disabled={bloqueado}
                                className="w-7 h-7 rounded-lg bg-white/5 hover:bg-red-500/10 border border-border hover:border-red-500/20 flex items-center justify-center text-muted hover:text-red-400 transition-all disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-white/5"
                                title="Cancelar"
                              >
                                <Ban className="w-3 h-3" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {visao === 'calendario' && (
        <CalendarioFullCalendar
          onSelect={(ag) => setSelecionado(ag)}
          onCreateSlot={(data, hora) => abrirNovoAgendamento(data, hora)}
          onReagendado={handleReagendado}
          onErro={(mensagem) => setNotification({ type: 'error', message: mensagem })}
          refreshTrigger={calendarRefresh}
        />
      )}

      <AgendamentoModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={handleCriado}
        dataInicial={prefillData}
        horaInicial={prefillHora}
      />

      <ReagendarModal target={reagendarTarget} onClose={() => setReagendarTarget(null)} onSuccess={handleReagendado} />

      <AgendamentoPanel
        agendamento={selecionado}
        onClose={() => setSelecionado(null)}
        onReagendar={(ag) => setReagendarTarget(ag)}
        onCancelar={(ag) => setCancelarTarget(ag)}
      />

      {/* Confirmação de cancelamento */}
      {cancelarTarget && (
        <div className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-surface border border-border rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <h3 className="font-outfit text-base font-black text-primary">Cancelar Agendamento</h3>
                <p className="text-xs text-muted mt-0.5">Esta ação não pode ser desfeita</p>
              </div>
            </div>
            <p className="text-sm text-secondary mb-6">
              Tem certeza que deseja cancelar o agendamento de{' '}
              <span className="font-bold text-primary">{cancelarTarget.leads?.company_name || 'lead'}</span> em{' '}
              <span className="font-bold text-primary">
                {formatarData(cancelarTarget.data_hora_inicio)} às {formatarHora(cancelarTarget.data_hora_inicio)}
              </span>
              ?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setCancelarTarget(null)}
                disabled={cancelando}
                className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 border border-border text-secondary text-[11px] font-black uppercase tracking-widest hover:bg-white/10 hover:text-primary transition-all disabled:opacity-60"
              >
                Voltar
              </button>
              <button
                onClick={handleCancelar}
                disabled={cancelando}
                className="flex-1 px-4 py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 text-[11px] font-black uppercase tracking-widest transition-all disabled:opacity-60"
              >
                {cancelando ? 'Cancelando...' : 'Cancelar Agendamento'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
