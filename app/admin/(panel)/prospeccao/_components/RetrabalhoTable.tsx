import { InboxIcon } from 'lucide-react';
import type { LeadProspeccao } from './types';

function diasParado(createdAt: string): number {
  const ms = Date.now() - new Date(createdAt).getTime();
  return Math.floor(ms / (1000 * 60 * 60 * 24));
}

export function RetrabalhoTable({
  leads,
  diasLimite,
}: {
  leads: LeadProspeccao[];
  diasLimite: number;
}) {
  const parados = leads
    .filter((l) => l.status === 'contatado' && diasParado(l.created_at) >= diasLimite)
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

  return (
    <div className="bg-surface border border-border rounded-2xl overflow-hidden">
      <div className="px-5 py-3.5 border-b border-border">
        <p className="text-[9px] font-black uppercase tracking-widest text-muted">
          Retrabalho — contatados há {diasLimite}+ dias sem avanço ({parados.length})
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[600px]">
          <thead>
            <tr className="border-b border-border bg-white/[0.015]">
              {['Título', 'Telefone', 'Termo de Busca', 'Dias Parado'].map((h) => (
                <th key={h} className="px-5 py-3 text-left text-[9px] font-black uppercase tracking-widest text-muted">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {parados.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-14">
                  <div className="flex flex-col items-center justify-center text-center">
                    <div className="w-12 h-12 rounded-2xl bg-white/5 border border-border flex items-center justify-center mb-3">
                      <InboxIcon className="w-5 h-5 text-muted" />
                    </div>
                    <p className="text-sm font-bold text-muted">Nenhum lead parado</p>
                  </div>
                </td>
              </tr>
            ) : (
              parados.map((lead) => (
                <tr key={lead.id} className="border-b border-border last:border-0">
                  <td className="px-5 py-3.5 text-sm font-bold text-primary">{lead.title}</td>
                  <td className="px-5 py-3.5 text-sm text-secondary">{lead.phone || '—'}</td>
                  <td className="px-5 py-3.5 text-sm text-muted">{lead.search_term || '—'}</td>
                  <td className="px-5 py-3.5">
                    <span className="inline-flex px-2 py-1 rounded-lg border text-[9px] font-black uppercase tracking-widest bg-red-500/15 text-red-400 border-red-500/20">
                      {diasParado(lead.created_at)} dias
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
