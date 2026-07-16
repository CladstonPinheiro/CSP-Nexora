'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin, { type DateClickArg } from '@fullcalendar/interaction';
import ptBrLocale from '@fullcalendar/core/locales/pt-br';
import type { EventClickArg, EventContentArg, EventInput, EventDropArg, DateSpanApi } from '@fullcalendar/core';
import { createSupabaseBrowserClient } from '@/lib/supabase';
import { reagendarAgendamento } from '../actions';
import { statusConfig, type Agendamento, type AgendamentoStatus } from './types';
import './calendario-fullcalendar.css';

interface CalendarioFullCalendarProps {
  onSelect: (agendamento: Agendamento) => void;
  onCreateSlot: (data: string, hora: string) => void;
  onReagendado: (agendamento: Agendamento) => void;
  onErro: (mensagem: string) => void;
  refreshTrigger?: number;
}

// Regra própria da Reunião de Briefing (independente do expediente geral em
// `agenda_hours`): só esses 4 horários fixos, nunca aos sábados/domingos.
// Serve só de guia visual — quem valida de verdade é a Edge Function.
const HORAS_BRIEFING = ['09:00', '11:00', '15:00', '17:00'];

const STATUS_EVENT_COLORS: Record<AgendamentoStatus, { bg: string; border: string; text: string }> = {
  agendado: { bg: '#3B82F6', border: '#3B82F6', text: '#060B24' },
  confirmado: { bg: '#22D3EE', border: '#22D3EE', text: '#060B24' },
  realizado: { bg: '#22C55E', border: '#22C55E', text: '#060B24' },
  faltou: { bg: '#F5821F', border: '#F5821F', text: '#060B24' },
  cancelado: { bg: 'rgba(239,68,68,0.25)', border: 'rgba(239,68,68,0.4)', text: '#FCA5A5' },
};

function pad(n: number) {
  return String(n).padStart(2, '0');
}

// FullCalendar, sem plugin de timezone (@fullcalendar/moment-timezone), não
// sabe calcular o offset de um fuso nomeado como "America/Sao_Paulo" — por
// isso os eventos são construídos como strings locais "ingênuas" (sem "Z"/
// offset), já convertidas para o horário de São Paulo, e a calendar usa o
// timeZone padrão ("local"): mesma técnica já usada em CalendarioSemana.tsx
// e page.tsx via Intl.DateTimeFormat.
function paraSaoPauloNaive(iso: string): string {
  const data = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo' }).format(new Date(iso));
  const hora = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'America/Sao_Paulo',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date(iso));
  return `${data}T${hora}:00`;
}

function formatarDataLocal(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
function formatarHoraLocal(d: Date): string {
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function renderEventContent(arg: EventContentArg) {
  const ag = arg.event.extendedProps.agendamento as Agendamento;
  const cancelado = ag.status === 'cancelado';
  return (
    <div className={`csp-fc-event ${cancelado ? 'csp-fc-event--cancelado' : ''}`}>
      <span className="csp-fc-event__status">{statusConfig[ag.status].label}</span>
      <span className="csp-fc-event__title">{ag.leads?.company_name || 'Lead'}</span>
    </div>
  );
}

export function CalendarioFullCalendar({
  onSelect,
  onCreateSlot,
  onReagendado,
  onErro,
  refreshTrigger,
}: CalendarioFullCalendarProps) {
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [loading, setLoading] = useState(true);
  const agendamentosRef = useRef<Agendamento[]>([]);
  agendamentosRef.current = agendamentos;

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
  }, [fetchAgendamentos, refreshTrigger]);

  const eventos: EventInput[] = agendamentos.map((ag) => {
    const cores = STATUS_EVENT_COLORS[ag.status];
    const cancelado = ag.status === 'cancelado';
    return {
      id: ag.id,
      title: ag.leads?.company_name || 'Agendamento',
      start: paraSaoPauloNaive(ag.data_hora_inicio),
      end: ag.data_hora_fim ? paraSaoPauloNaive(ag.data_hora_fim) : undefined,
      backgroundColor: cores.bg,
      borderColor: cores.border,
      textColor: cores.text,
      editable: !cancelado,
      extendedProps: { agendamento: ag },
    };
  });

  const handleEventClick = (arg: EventClickArg) => {
    const ag = agendamentosRef.current.find((a) => a.id === arg.event.id);
    if (ag) onSelect(ag);
  };

  const handleDateClick = (arg: DateClickArg) => {
    onCreateSlot(formatarDataLocal(arg.date), formatarHoraLocal(arg.date));
  };

  // Guia visual best-effort: bloqueia soltar fora dos 4 horários fixos do
  // Briefing ou em fim de semana. A validação real (feriados, conflitos,
  // expediente) continua sendo feita pela Edge Function no eventDrop.
  const handleEventAllow = (dropInfo: DateSpanApi) => {
    const dow = dropInfo.start.getDay();
    if (dow === 0 || dow === 6) return false;
    return HORAS_BRIEFING.includes(formatarHoraLocal(dropInfo.start));
  };

  const handleEventDrop = async (arg: EventDropArg) => {
    const ag = agendamentosRef.current.find((a) => a.id === arg.event.id);
    if (!ag || !arg.event.start) {
      arg.revert();
      return;
    }

    const res = await reagendarAgendamento(ag.id, {
      data: formatarDataLocal(arg.event.start),
      hora: formatarHoraLocal(arg.event.start),
    });

    if (res.error) {
      arg.revert();
      onErro(res.error);
      return;
    }

    const atualizado = { ...ag, ...(res.data as Partial<Agendamento>) } as Agendamento;
    setAgendamentos((prev) => prev.map((a) => (a.id === ag.id ? atualizado : a)));
    onReagendado(atualizado);
  };

  return (
    <div className="csp-fullcalendar relative">
      {loading && agendamentos.length === 0 && (
        <div className="csp-fullcalendar-loading">Carregando agenda...</div>
      )}
      {(!loading || agendamentos.length > 0) && (
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="timeGridWeek"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek',
          }}
          locale={ptBrLocale}
          height="auto"
          weekends={true}
          slotMinTime="08:00:00"
          slotMaxTime="19:00:00"
          slotDuration="01:00:00"
          allDaySlot={false}
          nowIndicator={true}
          editable={true}
          eventDurationEditable={false}
          eventAllow={handleEventAllow}
          selectable={false}
          dayMaxEvents={3}
          events={eventos}
          eventContent={renderEventContent}
          eventClick={handleEventClick}
          dateClick={handleDateClick}
          eventDrop={handleEventDrop}
        />
      )}
    </div>
  );
}
