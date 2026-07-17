import { SupabaseClient } from 'npm:@supabase/supabase-js@2';

const DURACAO_MINUTOS = 60;
const TZ_OFFSET = '-03:00'; // America/Sao_Paulo (sem horário de verão desde 2019)
const HORARIOS_FIXOS_BRIEFING = ['09:00', '11:00', '15:00', '17:00'];

const DIAS_SEMANA = [
  'domingo', 'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado',
] as const;

export type DiaSemana = (typeof DIAS_SEMANA)[number];

export function validarFormatoData(data: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(data) && !Number.isNaN(Date.parse(`${data}T00:00:00Z`));
}

export function validarFormatoHora(hora: string): boolean {
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(hora);
}

export function diaSemanaDe(data: string): DiaSemana {
  const indice = new Date(`${data}T00:00:00Z`).getUTCDay();
  return DIAS_SEMANA[indice];
}

function somarDias(data: string, dias: number): string {
  const d = new Date(`${data}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + dias);
  return d.toISOString().slice(0, 10);
}

export function hojeSaoPaulo(): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo' }).format(new Date());
}

export function dataEhPassada(data: string): boolean {
  return data < hojeSaoPaulo();
}

function dataHoraParaDate(data: string, hora: string): Date {
  return new Date(`${data}T${hora}:00${TZ_OFFSET}`);
}

function gerarSlots(horaInicio: string, horaFim: string): string[] {
  const [hIni, mIni] = horaInicio.split(':').map(Number);
  const [hFim, mFim] = horaFim.split(':').map(Number);

  const minutosInicio = hIni * 60 + mIni;
  const minutosFim = hFim * 60 + mFim;

  return HORARIOS_FIXOS_BRIEFING.filter((horario) => {
    const [h, m] = horario.split(':').map(Number);
    const minutosSlot = h * 60 + m;
    return minutosSlot >= minutosInicio && minutosSlot + DURACAO_MINUTOS <= minutosFim;
  });
}

export type ResultadoSlots =
  | { tipo: 'AGENDA_FECHADA' }
  | { tipo: 'OK'; slots: string[]; horaInicio: string; horaFim: string };

interface OpcoesCalculoSlots {
  ignorarAgendamentoId?: string;
}

export async function calcularSlotsDisponiveis(
  supabase: SupabaseClient,
  data: string,
  opcoes: OpcoesCalculoSlots = {}
): Promise<ResultadoSlots> {
  const dia = diaSemanaDe(data);

  if (dia === 'sabado') {
    return { tipo: 'AGENDA_FECHADA' };
  }

  const { data: feriado, error: erroFeriado } = await supabase
    .from('feriados')
    .select('data')
    .eq('data', data)
    .maybeSingle();

  if (erroFeriado) throw erroFeriado;

  if (feriado) {
    return { tipo: 'AGENDA_FECHADA' };
  }

  const { data: horarioDia, error: erroHorario } = await supabase
    .from('agenda_hours')
    .select('aberto, hora_inicio, hora_fim')
    .eq('dia', dia)
    .maybeSingle();

  if (erroHorario) throw erroHorario;

  if (!horarioDia || !horarioDia.aberto || !horarioDia.hora_inicio || !horarioDia.hora_fim) {
    return { tipo: 'AGENDA_FECHADA' };
  }

  const horaInicio = String(horarioDia.hora_inicio).slice(0, 5);
  const horaFim = String(horarioDia.hora_fim).slice(0, 5);
  let slots = gerarSlots(horaInicio, horaFim);

  const inicioDoDia = `${data}T00:00:00${TZ_OFFSET}`;
  const inicioDoDiaSeguinte = `${somarDias(data, 1)}T00:00:00${TZ_OFFSET}`;

  let query = supabase
    .from('agendamentos')
    .select('id, data_hora_inicio, data_hora_fim')
    .neq('status', 'cancelado')
    .gte('data_hora_inicio', inicioDoDia)
    .lt('data_hora_inicio', inicioDoDiaSeguinte);

  if (opcoes.ignorarAgendamentoId) {
    query = query.neq('id', opcoes.ignorarAgendamentoId);
  }

  const { data: agendamentosDoDia, error: erroAgendamentos } = await query;
  if (erroAgendamentos) throw erroAgendamentos;

  if (agendamentosDoDia && agendamentosDoDia.length > 0) {
    slots = slots.filter((slot) => {
      const slotInicio = dataHoraParaDate(data, slot);
      const slotFim = new Date(slotInicio.getTime() + DURACAO_MINUTOS * 60_000);

      return !agendamentosDoDia.some((ag) => {
        const agInicio = new Date(ag.data_hora_inicio as string);
        const agFim = new Date(ag.data_hora_fim as string);
        return slotInicio < agFim && slotFim > agInicio;
      });
    });
  }

  if (data === hojeSaoPaulo()) {
    const agora = new Date();
    slots = slots.filter((slot) => dataHoraParaDate(data, slot) > agora);
  }

  return { tipo: 'OK', slots, horaInicio, horaFim };
}

export function sugerirHorarios(slotsLivres: string[], horaReferencia: string, quantidade = 3): string[] {
  const depois = slotsLivres.filter((s) => s > horaReferencia);
  if (depois.length > 0) return depois.slice(0, quantidade);
  return slotsLivres.slice(0, quantidade);
}

export function dataHoraISO(data: string, hora: string): string {
  return dataHoraParaDate(data, hora).toISOString();
}
