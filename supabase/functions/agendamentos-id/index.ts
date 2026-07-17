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

function extrairId(req: Request): string | null {
  const partes = new URL(req.url).pathname.split('/').filter(Boolean);
  const id = partes[partes.length - 1];
  // Evita capturar o próprio nome da function caso a rota seja chamada sem :id
  if (!id || id === 'agendamentos-id') return null;
  return id;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return respostaOptions();

  const auth = validarAuth(req);
  if (!auth.ok) return auth.response;
  const { supabase } = auth;

  const id = extrairId(req);
  if (!id) {
    return respostaErro(404, 'AGENDAMENTO_NAO_ENCONTRADO', 'ID do agendamento não informado na URL.');
  }

  try {
    const { data: agendamento, error: erroBusca } = await supabase
      .from('agendamentos')
      .select('id, lead_id, assunto, data_hora_inicio, data_hora_fim, status')
      .eq('id', id)
      .maybeSingle();

    if (erroBusca) throw erroBusca;
    if (!agendamento) {
      return respostaErro(404, 'AGENDAMENTO_NAO_ENCONTRADO', 'O ID do agendamento não existe.');
    }

    if (req.method === 'PUT') {
      if (agendamento.status === 'cancelado') {
        return respostaErro(
          422,
          'AGENDAMENTO_CANCELADO_NAO_REAGENDAVEL',
          'Não é possível reagendar um agendamento que foi cancelado.'
        );
      }

      const body = await req.json().catch(() => ({}));
      const { data, hora } = body as { data?: string; hora?: string };

      if (!data) {
        return respostaErro(422, 'CAMPO_OBRIGATORIO_AUSENTE', 'É necessário informar data.', { campo: 'data' });
      }
      if (!hora) {
        return respostaErro(422, 'CAMPO_OBRIGATORIO_AUSENTE', 'É necessário informar hora.', { campo: 'hora' });
      }
      if (!validarFormatoData(data) || !validarFormatoHora(hora)) {
        return respostaErro(422, 'FORMATO_INVALIDO', 'Formato de data ou hora inválido. Use YYYY-MM-DD e HH:MM.');
      }
      if (dataEhPassada(data)) {
        return respostaErro(200, 'DATA_PASSADA', 'Não é possível agendar para uma data que já passou.');
      }

      const resultadoSlots = await calcularSlotsDisponiveis(supabase, data, { ignorarAgendamentoId: id });

      if (resultadoSlots.tipo === 'AGENDA_FECHADA') {
        return respostaErro(200, 'AGENDA_FECHADA', 'A agenda não tem atendimentos no dia solicitado.');
      }

      if (!resultadoSlots.slots.includes(hora)) {
        return respostaErro(
          200,
          'HORARIO_OCUPADO',
          'O horário solicitado não está disponível. Aqui estão os próximos horários livres:',
          { sugestoes: sugerirHorarios(resultadoSlots.slots, hora).map((h) => dataHoraISO(data, h)) }
        );
      }

      const { data: atualizado, error: erroUpdate } = await supabase
        .from('agendamentos')
        .update({ data_hora_inicio: dataHoraISO(data, hora), status: 'agendado' })
        .eq('id', id)
        .select('id, lead_id, assunto, data_hora_inicio, data_hora_fim, status')
        .single();

      if (erroUpdate) throw erroUpdate;

      return respostaSucesso(200, 'AGENDAMENTO_REAGENDADO', 'Agendamento reagendado com sucesso.', {
        agendamento: atualizado,
      });
    }

    if (req.method === 'DELETE') {
      if (agendamento.status === 'cancelado') {
        return respostaErro(422, 'AGENDAMENTO_JA_CANCELADO', 'Este agendamento já foi cancelado anteriormente.');
      }

      const { data: cancelado, error: erroCancel } = await supabase
        .from('agendamentos')
        .update({ status: 'cancelado' })
        .eq('id', id)
        .select('id, status')
        .single();

      if (erroCancel) throw erroCancel;

      return respostaSucesso(200, 'AGENDAMENTO_CANCELADO', 'Agendamento cancelado com sucesso.', {
        agendamento: cancelado,
      });
    }

    return respostaErro(405, 'ERRO_INTERNO', 'Método não permitido. Use PUT ou DELETE.');
  } catch (err) {
    console.error('[agendamentos-id] erro:', err);
    return respostaErro(500, 'ERRO_INTERNO', 'Erro inesperado no servidor.');
  }
});
