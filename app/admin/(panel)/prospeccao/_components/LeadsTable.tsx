'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight, Instagram, InboxIcon } from 'lucide-react';
import { statusConfig, type LeadProspeccao } from './types';
import { WhatsAppButton } from './WhatsAppButton';
import { LeadDetailModal } from './LeadDetailModal';

const PAGE_SIZE = 50;

export function LeadsTable({ leads }: { leads: LeadProspeccao[] }) {
  const [page, setPage] = useState(1);
  const [selectedLead, setSelectedLead] = useState<LeadProspeccao | null>(null);

  const totalPages = Math.max(1, Math.ceil(leads.length / PAGE_SIZE));
  const start = (page - 1) * PAGE_SIZE;
  const pageItems = leads.slice(start, start + PAGE_SIZE);

  function goToPage(p: number) {
    setPage(Math.min(Math.max(1, p), totalPages));
  }

  return (
    <div className="bg-surface border border-border rounded-2xl overflow-hidden mb-6">
      <div className="px-6 py-4 border-b border-border flex items-center justify-between">
        <p className="text-[9px] font-black uppercase tracking-widest text-muted">Leads ({leads.length})</p>
        {totalPages > 1 && (
          <p className="text-[10px] font-bold text-muted">
            {start + 1}–{Math.min(start + PAGE_SIZE, leads.length)} de {leads.length}
          </p>
        )}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px]">
          <thead>
            <tr className="border-b border-border bg-white/[0.015]">
              {['Título', 'Telefone', 'Categoria', 'Status', 'Avaliações', 'Nota', ''].map((h) => (
                <th key={h} className="px-5 py-3 text-left text-[9px] font-black uppercase tracking-widest text-muted">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pageItems.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-16">
                  <div className="flex flex-col items-center justify-center text-center">
                    <div className="w-12 h-12 rounded-2xl bg-white/5 border border-border flex items-center justify-center mb-3">
                      <InboxIcon className="w-5 h-5 text-muted" />
                    </div>
                    <p className="text-sm font-bold text-muted">Nenhum lead encontrado</p>
                  </div>
                </td>
              </tr>
            ) : (
              pageItems.map((lead) => (
                <tr
                  key={lead.id}
                  onClick={() => setSelectedLead(lead)}
                  className="border-b border-border last:border-0 cursor-pointer hover:bg-white/[0.025] transition-colors"
                >
                  <td className="px-5 py-3.5 text-sm font-bold text-primary">
                    <div className="flex items-center gap-2">
                      {lead.title}
                      {lead.instagram_url && (
                        <a
                          href={lead.instagram_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          title="Tem Instagram"
                          className="shrink-0 w-5 h-5 rounded-md bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-400"
                        >
                          <Instagram className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-sm text-secondary">{lead.phone || '—'}</td>
                  <td className="px-5 py-3.5 text-sm text-muted">{lead.category_name || '—'}</td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex px-2 py-1 rounded-lg border text-[9px] font-black uppercase tracking-widest ${statusConfig[lead.status].style}`}>
                      {statusConfig[lead.status].label}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-sm text-muted">{lead.reviews_count ?? '—'}</td>
                  <td className="px-5 py-3.5 text-sm text-muted">{lead.total_score ?? '—'}</td>
                  <td className="px-5 py-3.5" onClick={(e) => e.stopPropagation()}>
                    <WhatsAppButton phone={lead.phone} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 px-6 py-4 border-t border-border">
          <button
            onClick={() => goToPage(page - 1)}
            disabled={page === 1}
            className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 border border-border flex items-center justify-center text-muted hover:text-primary transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-[11px] font-bold text-secondary tabular-nums">
            Página {page} de {totalPages}
          </span>
          <button
            onClick={() => goToPage(page + 1)}
            disabled={page === totalPages}
            className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 border border-border flex items-center justify-center text-muted hover:text-primary transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {selectedLead && (
        <LeadDetailModal lead={selectedLead} onClose={() => setSelectedLead(null)} />
      )}
    </div>
  );
}
