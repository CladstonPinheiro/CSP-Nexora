'use client';

import { Fragment } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { statusConfig, type Agendamento } from './types';

interface CalendarioSemanaProps {
  agendamentos: Agendamento[];
  weekStart: string; // YYYY-MM-DD, segunda-feira da semana exibida
  onPrevWeek: () => void;
  onNextWeek: () => void;
  onHoje: () => void;
  onSelect: (agendamento: Agendamento) => void;
  onCreateSlot: (data: string, hora: string) => void;
}

const HORAS = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'];
const DIAS_LABEL = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'];

function somarDias(data: string, dias: number): string {
  const d = new Date(`${data}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + dias);
  return d.toISOString().slice(0, 10);
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
function formatarDiaCurto(data: string) {
  const d = new Date(`${data}T12:00:00Z`);
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', timeZone: 'America/Sao_Paulo' });
}

export function CalendarioSemana({
  agendamentos,
  weekStart,
  onPrevWeek,
  onNextWeek,
  onHoje,
  onSelect,
  onCreateSlot,
}: CalendarioSemanaProps) {
  const dias = [0, 1, 2, 3, 4].map((i) => somarDias(weekStart, i));
  const fimSemana = dias[4];

  const grade = new Map<string, Agendamento>();
  for (const ag of agendamentos) {
    const d = paraSaoPauloData(ag.data_hora_inicio);
    const h = paraSaoPauloHora(ag.data_hora_inicio);
    if (!dias.includes(d) || !HORAS.includes(h)) continue;
    const chave = `${d}_${h}`;
    const existente = grade.get(chave);
    if (!existente || (existente.status === 'cancelado' && ag.status !== 'cancelado')) {
      grade.set(chave, ag);
    }
  }

  return (
    <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/5 flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={onPrevWeek}
            className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-gray-500 hover:text-white transition-all"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={onNextWeek}
            className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-gray-500 hover:text-white transition-all"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            onClick={onHoje}
            className="ml-1 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-white transition-all"
          >
            Hoje
          </button>
        </div>
        <p className="text-xs font-bold text-gray-500">
          {formatarDiaCurto(weekStart)} — {formatarDiaCurto(fimSemana)}
        </p>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[720px] grid grid-cols-[64px_repeat(5,1fr)]">
          <div className="border-b border-white/5" />
          {dias.map((d, i) => (
            <div key={d} className="border-b border-l border-white/5 px-2 py-3 text-center">
              <p className="text-[9px] font-black uppercase tracking-widest text-gray-600">{DIAS_LABEL[i]}</p>
              <p className="text-xs font-bold text-gray-400 mt-0.5">{formatarDiaCurto(d)}</p>
            </div>
          ))}

          {HORAS.map((hora) => (
            <Fragment key={hora}>
              <div className="border-b border-white/5 px-2 py-3 text-[10px] font-bold text-gray-700 text-right">
                {hora}
              </div>
              {dias.map((d) => {
                const ag = grade.get(`${d}_${hora}`);

                if (!ag) {
                  return (
                    <button
                      key={`${d}_${hora}`}
                      type="button"
                      onClick={() => onCreateSlot(d, hora)}
                      className="border-b border-l border-dashed border-white/5 min-h-[56px] px-2 py-2 text-left hover:bg-white/[0.03] transition-colors"
                    >
                      <span className="text-[9px] font-bold uppercase tracking-widest text-gray-800">Livre</span>
                    </button>
                  );
                }

                const cancelado = ag.status === 'cancelado';
                return (
                  <button
                    key={`${d}_${hora}`}
                    type="button"
                    onClick={() => onSelect(ag)}
                    className={`border-b border-l border-white/5 min-h-[56px] px-2 py-2 text-left transition-colors ${
                      cancelado ? 'bg-red-500/[0.04] hover:bg-red-500/[0.08]' : 'bg-cyan-500/[0.06] hover:bg-cyan-500/[0.1]'
                    }`}
                  >
                    <span
                      className={`inline-flex px-1.5 py-0.5 rounded border text-[8px] font-black uppercase tracking-widest ${statusConfig[ag.status].style}`}
                    >
                      {statusConfig[ag.status].label}
                    </span>
                    <p className={`text-xs font-bold mt-1 truncate ${cancelado ? 'text-gray-600 line-through' : 'text-white'}`}>
                      {ag.leads?.company_name || 'Lead'}
                    </p>
                  </button>
                );
              })}
            </Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}
