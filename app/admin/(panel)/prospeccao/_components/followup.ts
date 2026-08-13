import type { LeadProspeccao } from './types';

export type FollowUpAlert = {
  diasParado: number;
  label: string;
  colorStyle: string;
};

const STATUS_SEM_ALERTA = new Set(['Cliente', 'Descartado']);

export function getFollowUpAlert(lead: LeadProspeccao): FollowUpAlert | null {
  if (!lead.status_cadencia || STATUS_SEM_ALERTA.has(lead.status_cadencia)) return null;

  const datas = [lead.data_msg_1, lead.data_msg_2, lead.data_msg_3, lead.data_msg_4, lead.data_msg_5].filter(
    (d): d is string => !!d
  );
  if (datas.length === 0) return null;

  const maisRecente = datas.reduce((latest, current) =>
    new Date(current).getTime() > new Date(latest).getTime() ? current : latest
  );

  const diasParado = Math.floor((Date.now() - new Date(maisRecente).getTime()) / (1000 * 60 * 60 * 24));

  if (diasParado < 2) return null;

  if (diasParado <= 4) {
    return { diasParado, label: 'Follow-up 1 pendente', colorStyle: 'bg-amber-500/15 text-amber-400 border-amber-500/20' };
  }
  if (diasParado <= 7) {
    return { diasParado, label: 'Follow-up 2 pendente', colorStyle: 'bg-amber-500/15 text-amber-400 border-amber-500/20' };
  }
  if (diasParado <= 11) {
    return { diasParado, label: 'Follow-up 3 pendente', colorStyle: 'bg-orange-500/15 text-orange-400 border-orange-500/20' };
  }
  return { diasParado, label: 'Encerramento pendente', colorStyle: 'bg-red-500/15 text-red-400 border-red-500/20' };
}
