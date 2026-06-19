'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, SlidersHorizontal, InboxIcon } from 'lucide-react';
import { createSupabaseBrowserClient } from '@/lib/supabase';
import { LeadModal } from './_components/LeadModal';
import { LeadPanel } from './_components/LeadPanel';
import {
  STAGE_ORDER,
  estagioConfig,
  origemConfig,
  nichoLabel,
  type Lead,
} from './_components/types';

const ALL_STAGES = [...STAGE_ORDER, 'perdido' as const];
const ALL_ORIGINS = Object.keys(origemConfig);

function EstagioBadge({ value }: { value: string }) {
  const cfg = estagioConfig[value];
  if (!cfg) return <span className="text-sm text-gray-700">—</span>;
  return (
    <span className={`inline-flex px-2 py-1 rounded-lg border text-[9px] font-black uppercase tracking-widest whitespace-nowrap ${cfg.style}`}>
      {cfg.label}
    </span>
  );
}

function OrigemBadge({ value }: { value: string }) {
  const cfg = origemConfig[value];
  if (!cfg) return <span className="text-sm text-gray-700">—</span>;
  return (
    <span className={`inline-flex px-2 py-1 rounded-lg border text-[9px] font-black uppercase tracking-widest whitespace-nowrap ${cfg.style}`}>
      {cfg.label}
    </span>
  );
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
  });
}

const SELECT_CLASS =
  'bg-[#0D0D0D] border border-white/10 rounded-xl px-3 py-2 text-gray-400 text-xs font-bold focus:outline-none focus:border-cyan-500/40 transition-all cursor-pointer min-w-[170px]';

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterEstagio, setFilterEstagio] = useState('');
  const [filterOrigem, setFilterOrigem] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    const supabase = createSupabaseBrowserClient();
    const { data } = await supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false });
    setLeads(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  const filteredLeads = leads.filter((l) => {
    if (filterEstagio && l.estagio !== filterEstagio) return false;
    if (filterOrigem && l.origem !== filterOrigem) return false;
    return true;
  });

  const handleLeadCreated = (lead: Lead) => {
    setLeads((prev) => [lead, ...prev]);
    setModalOpen(false);
  };

  const handleLeadUpdate = (updated: Lead) => {
    setLeads((prev) => prev.map((l) => (l.id === updated.id ? updated : l)));
    setSelectedLead(updated);
  };

  const hasFilters = filterEstagio || filterOrigem;

  return (
    <div className="p-8 min-h-screen">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="font-outfit text-3xl font-black tracking-tight text-white">Leads</h1>
          <p className="text-gray-600 text-sm mt-1">
            {loading
              ? 'Carregando...'
              : `${filteredLeads.length}${hasFilters ? ` de ${leads.length}` : ''} lead${leads.length !== 1 ? 's' : ''} cadastrado${leads.length !== 1 ? 's' : ''}`}
          </p>
        </div>

        <button onClick={() => setModalOpen(true)} className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl blur opacity-40 group-hover:opacity-70 transition duration-300" />
          <div className="relative flex items-center gap-2 bg-white text-black px-5 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all">
            <Plus className="w-4 h-4" />
            Novo Lead
          </div>
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-5 flex-wrap">
        <SlidersHorizontal className="w-4 h-4 text-gray-700 shrink-0" />
        <select
          value={filterEstagio}
          onChange={(e) => setFilterEstagio(e.target.value)}
          className={SELECT_CLASS}
          style={{ backgroundColor: '#0D0D0D' }}
        >
          <option value="">Todos os estágios</option>
          {ALL_STAGES.map((s) => (
            <option key={s} value={s}>
              {estagioConfig[s]?.label ?? s}
            </option>
          ))}
        </select>
        <select
          value={filterOrigem}
          onChange={(e) => setFilterOrigem(e.target.value)}
          className={SELECT_CLASS}
          style={{ backgroundColor: '#0D0D0D' }}
        >
          <option value="">Todas as origens</option>
          {ALL_ORIGINS.map((o) => (
            <option key={o} value={o}>
              {origemConfig[o]?.label ?? o}
            </option>
          ))}
        </select>
        {hasFilters && (
          <button
            onClick={() => {
              setFilterEstagio('');
              setFilterOrigem('');
            }}
            className="text-[11px] text-gray-600 hover:text-gray-400 transition-colors font-black uppercase tracking-widest"
          >
            Limpar filtros
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.015]">
                {['Empresa', 'Contato', 'Nicho', 'Cidade', 'Origem', 'Estágio', 'Data'].map(
                  (h) => (
                    <th
                      key={h}
                      className="px-5 py-3.5 text-left text-[9px] font-black uppercase tracking-widest text-gray-600"
                    >
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="border-b border-white/5">
                    {Array.from({ length: 7 }).map((_, j) => (
                      <td key={j} className="px-5 py-4">
                        <div
                          className="h-3 bg-white/5 rounded-lg animate-pulse"
                          style={{ width: `${50 + (j * 17 + i * 11) % 40}%` }}
                        />
                      </td>
                    ))}
                  </tr>
                ))
              ) : filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-20">
                    <div className="flex flex-col items-center justify-center text-center">
                      <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-4">
                        <InboxIcon className="w-6 h-6 text-gray-700" />
                      </div>
                      <p className="text-sm font-bold text-gray-600">Nenhum lead encontrado</p>
                      <p className="text-xs text-gray-700 mt-1">
                        {hasFilters
                          ? 'Tente ajustar os filtros'
                          : 'Adicione o primeiro lead pelo botão acima'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredLeads.map((lead) => (
                  <tr
                    key={lead.id}
                    onClick={() => setSelectedLead(lead)}
                    className={`border-b border-white/5 last:border-0 cursor-pointer transition-colors ${
                      selectedLead?.id === lead.id
                        ? 'bg-cyan-500/[0.04]'
                        : 'hover:bg-white/[0.025]'
                    }`}
                  >
                    {/* Empresa */}
                    <td className="px-5 py-4">
                      <span className="text-sm font-bold text-white">
                        {lead.empresa || '—'}
                      </span>
                    </td>

                    {/* Contato */}
                    <td className="px-5 py-4">
                      <p className="text-sm text-white">{lead.nome || '—'}</p>
                      {lead.email && (
                        <p className="text-xs text-gray-600 mt-0.5">{lead.email}</p>
                      )}
                    </td>

                    {/* Nicho */}
                    <td className="px-5 py-4 text-sm text-gray-500">
                      {lead.nicho ? (nichoLabel[lead.nicho] ?? lead.nicho) : '—'}
                    </td>

                    {/* Cidade */}
                    <td className="px-5 py-4 text-sm text-gray-500">
                      {lead.cidade || '—'}
                    </td>

                    {/* Origem */}
                    <td className="px-5 py-4">
                      {lead.origem ? (
                        <OrigemBadge value={lead.origem} />
                      ) : (
                        <span className="text-sm text-gray-700">—</span>
                      )}
                    </td>

                    {/* Estágio */}
                    <td className="px-5 py-4">
                      {lead.estagio ? (
                        <EstagioBadge value={lead.estagio} />
                      ) : (
                        <span className="text-sm text-gray-700">—</span>
                      )}
                    </td>

                    {/* Data */}
                    <td className="px-5 py-4 text-xs text-gray-600 whitespace-nowrap">
                      {lead.created_at ? formatDate(lead.created_at) : '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <LeadModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={handleLeadCreated}
      />

      <LeadPanel
        lead={selectedLead}
        onClose={() => setSelectedLead(null)}
        onUpdate={handleLeadUpdate}
      />
    </div>
  );
}
