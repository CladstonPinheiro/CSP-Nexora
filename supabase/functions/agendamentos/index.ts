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

  if (req.method !== 'POST') {
    return respostaErro(405, 'ERRO_INTERNO', 'Método não permitido. Use POST.');
  }

  const auth = validarAuth(req);
  if (!auth.ok) return auth.response;
  const { supabase } = auth;

  try {
    const body = await req.json().catch(() => ({}));
    const { lead_id, assunto, data, hora, observacoes } = body as {
      lead_id?: string;
      assunto?: string;
      data?: string;
      hora?: string;
      observacoes?: string;
    };

    if (!lead_id) {
      return respostaErro(422, 'CAMPO_OBRIGATORIO_AUSENTE', 'É necessário informar lead_id.', { campo: 'lead_id' });
    }
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

    const { data: lead, error: erroLead } = await supabase
      .from('leads')
      .select('id')
      .eq('id', lead_id)
      .maybeSingle();

    if (erroLead) throw erroLead;
    if (!lead) {
      return respostaErro(404, 'LEAD_NAO_ENCONTRADO', 'O lead_id informado não existe.');
    }

    const resultadoSlots = await calcularSlotsDisponiveis(supabase, data);

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

    const { data: agendamento, error: erroInsert } = await supabase
      .from('agendamentos')
      .insert([
        {
          lead_id,
          assunto: assunto ?? null,
          observacoes: observacoes ?? null,
          data_hora_inicio: dataHoraISO(data, hora),
        },
      ])
      .select('id, lead_id, assunto, data_hora_inicio, data_hora_fim, status')
      .single();

    if (erroInsert) throw erroInsert;

    return respostaSucesso(201, 'AGENDAMENTO_CRIADO', 'Agendamento criado com sucesso.', {
      agendamento,
    });
  } catch (err) {
    console.error('[agendamentos] erro:', err);
    return respostaErro(500, 'ERRO_INTERNO', 'Erro inesperado no servidor.');
  }
});
