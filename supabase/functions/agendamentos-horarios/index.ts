import { validarAuth } from '../_shared/auth.ts';
import { respostaErro, respostaSucesso, respostaOptions } from '../_shared/errors.ts';
import {
  calcularSlotsDisponiveis,
  dataEhPassada,
  dataHoraISO,
  sugerirHorarios,
  validarFormatoData,
  validarFormatoHora,
} from '../_shared/slots.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return respostaOptions();

  if (req.method !== 'GET') {
    return respostaErro(405, 'ERRO_INTERNO', 'Método não permitido. Use GET.');
  }

  const auth = validarAuth(req);
  if (!auth.ok) return auth.response;
  const { supabase } = auth;

  try {
    const url = new URL(req.url);
    const data = url.searchParams.get('data') ?? '';
    const hora = url.searchParams.get('hora');

    if (!data) {
      return respostaErro(422, 'CAMPO_OBRIGATORIO_AUSENTE', 'É necessário informar data.', { campo: 'data' });
    }
    if (!validarFormatoData(data) || (hora && !validarFormatoHora(hora))) {
      return respostaErro(422, 'FORMATO_INVALIDO', 'Formato de data ou hora inválido. Use YYYY-MM-DD e HH:MM.');
    }

    if (dataEhPassada(data)) {
      return respostaErro(200, 'DATA_PASSADA', 'Não é possível consultar uma data que já passou.');
    }

    const resultadoSlots = await calcularSlotsDisponiveis(supabase, data);

    if (resultadoSlots.tipo === 'AGENDA_FECHADA') {
      return respostaErro(200, 'AGENDA_FECHADA', 'A agenda não tem atendimentos no dia solicitado.');
    }

    if (hora) {
      if (resultadoSlots.slots.includes(hora)) {
        return respostaSucesso(200, 'HORARIO_DISPONIVEL', 'O horário solicitado está disponível.', {
          horario: dataHoraISO(data, hora),
        });
      }

      return respostaErro(
        200,
        'HORARIO_OCUPADO',
        'O horário solicitado não está disponível. Aqui estão os próximos horários livres:',
        { sugestoes: sugerirHorarios(resultadoSlots.slots, hora).map((h) => dataHoraISO(data, h)) }
      );
    }

    const mensagem =
      resultadoSlots.slots.length > 0
        ? `Horários disponíveis para o dia ${data}.`
        : 'Não há horários disponíveis para o dia solicitado.';

    return respostaSucesso(200, 'HORARIOS_DISPONIVEIS', mensagem, {
      data,
      duracao_minutos: 60,
      slots_disponiveis: resultadoSlots.slots,
    });
  } catch (err) {
    console.error('[agendamentos-horarios] erro:', err);
    return respostaErro(500, 'ERRO_INTERNO', 'Erro inesperado no servidor.');
  }
});
