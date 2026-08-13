'use client';

import { useState } from 'react';
import { AlertTriangle, InboxIcon } from 'lucide-react';
import type { LeadProspeccao } from './types';
import { getFollowUpAlert, type FollowUpAlert } from './followup';
import { LeadDetailModal } from './LeadDetailModal';

export function FollowUpTable({ leads }: { leads: LeadProspeccao[] }) {
  const [modalLead, setModalLead] = useState<LeadProspeccao | null>(null);

  const pendentes = leads
    .map((lead) => {
      const alert = getFollowUpAlert(lead);
      return alert ? { lead, alert } : null;
    })
    .filter((item): item is { lead: LeadProspeccao; alert: FollowUpAlert } => item !== null)
    .sort((a, b) => b.alert.diasParado - a.alert.diasParado);

  return (
    <div className="bg-surface border border-border rounded-2xl overflow-hidden mb-6">
      <div className="px-5 py-3.5 border-b border-border">
        <p className="text-[9px] font-black uppercase tracking-widest text-muted">
          Follow-ups Pendentes ({pendentes.length})
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[600px]">
          <thead>
            <tr className="border-b border-border bg-white/[0.015]">
              {['Empresa', 'Telefone', 'Dias Parado', 'Follow-up Devido'].map((h) => (
                <th key={h} className="px-5 py-3 text-left text-[9px] font-black uppercase tracking-widest text-muted">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pendentes.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-14">
                  <div className="flex flex-col items-center justify-center text-center">
                    <div className="w-12 h-12 rounded-2xl bg-white/5 border border-border flex items-center justify-center mb-3">
                      <InboxIcon className="w-5 h-5 text-muted" />
                    </div>
                    <p className="text-sm font-bold text-muted">Nenhum follow-up pendente</p>
                  </div>
                </td>
              </tr>
            ) : (
              pendentes.map(({ lead, alert }) => (
                <tr
                  key={lead.id}
                  onClick={() => setModalLead(lead)}
                  className="border-b border-border last:border-0 cursor-pointer hover:bg-white/[0.025] transition-colors"
                >
                  <td className="px-5 py-3.5 text-sm font-bold text-primary">{lead.title}</td>
                  <td className="px-5 py-3.5 text-sm text-secondary">{lead.whatsapp || lead.phone || '—'}</td>
                  <td className="px-5 py-3.5 text-sm text-muted">{alert.diasParado} dias</td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg border text-[9px] font-black uppercase tracking-widest ${alert.colorStyle}`}>
                      <AlertTriangle className="w-3 h-3" />
                      {alert.label}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {modalLead && (
        <LeadDetailModal lead={modalLead} mode="view" onClose={() => setModalLead(null)} />
      )}
    </div>
  );
}
