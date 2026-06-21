'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, SlidersHorizontal, InboxIcon, Pencil, Trash2, AlertTriangle, Building2 } from 'lucide-react';
import Link from 'next/link';
import { createSupabaseBrowserClient } from '@/lib/supabase';
import { deleteLead } from './actions';
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
  'bg-[#0D0D0D] border border-white/10 rounded-xl px-3 py-2 text-gray-400 text-xs font-bold focus:outline-none focus:border-white/20 transition-all cursor-pointer min-w-[170px]';

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterEstagio, setFilterEstagio] = useState('');
  const [filterOrigem, setFilterOrigem] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editLead, setEditLead] = useState<Lead | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Lead | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [convertedMap, setConvertedMap] = useState<Map<string, string>>(new Map());

  const refreshConvertedMap = useCallback(async () => {
    const supabase = createSupabaseBrowserClient();
    const { data } = await supabase.from('clientes').select('id, lead_id').not('lead_id', 'is', null);
    setConvertedMap(new Map((data ?? []).map(c => [c.lead_id!, c.id])));
  }, []);

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    const supabase = createSupabaseBrowserClient();
    const [{ data: leadsData }, { data: clientesData }] = await Promise.all([
      supabase.from('leads').select('*').order('created_at', { ascending: false }),
      supabase.from('clientes').select('id, lead_id').not('lead_id', 'is', null),
    ]);
    setLeads(leadsData ?? []);
    setConvertedMap(new Map((clientesData ?? []).map(c => [c.lead_id!, c.id])));
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  // Auto-open panel when navigating from clientes with ?leadId=
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const leadId = params.get('leadId');
    if (leadId && leads.length > 0) {
      const found = leads.find(l => l.id === leadId);
      if (found) setSelectedLead(found);
    }
  }, [leads]);

  const filteredLeads = leads.filter((l) => {
    if (filterEstagio && l.stage !== filterEstagio) return false;
    if (filterOrigem && l.source !== filterOrigem) return false;
    return true;
  });

  const handleLeadCreated = (lead: Lead) => {
    setLeads((prev) => [lead, ...prev]);
    setModalOpen(false);
  };

  const handleLeadEdited = (updated: Lead) => {
    setLeads((prev) => prev.map((l) => (l.id === updated.id ? updated : l)));
    if (selectedLead?.id === updated.id) setSelectedLead(updated);
    setEditLead(null);
  };

  const handleLeadUpdate = (updated: Lead) => {
    setLeads((prev) => prev.map((l) => (l.id === updated.id ? updated : l)));
    setSelectedLead(updated);
    if (updated.stage === 'fechado') refreshConvertedMap();
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    const { error } = await deleteLead(deleteTarget.id);
    if (!error) {
      setLeads((prev) => prev.filter((l) => l.id !== deleteTarget.id));
      if (selectedLead?.id === deleteTarget.id) setSelectedLead(null);
    }
    setDeleteTarget(null);
    setDeleting(false);
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
          <table className="w-full min-w-[1060px]">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.015]">
                {['Empresa', 'Contato', 'Nicho', 'Cidade', 'Origem', 'Estágio', 'Data', 'Cliente', 'Ações'].map(
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
                    {Array.from({ length: 9 }).map((_, j) => (
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
                  <td colSpan={9} className="py-20">
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
                        {lead.company_name || '—'}
                      </span>
                    </td>

                    {/* Contato */}
                    <td className="px-5 py-4">
                      <p className="text-sm text-white">{lead.contact_name || '—'}</p>
                      {lead.email && (
                        <p className="text-xs text-gray-600 mt-0.5">{lead.email}</p>
                      )}
                    </td>

                    {/* Nicho */}
                    <td className="px-5 py-4 text-sm text-gray-500">
                      {lead.niche ? (nichoLabel[lead.niche] ?? lead.niche) : '—'}
                    </td>

                    {/* Cidade */}
                    <td className="px-5 py-4 text-sm text-gray-500">
                      {lead.city || '—'}
                    </td>

                    {/* Origem */}
                    <td className="px-5 py-4">
                      {lead.source ? (
                        <OrigemBadge value={lead.source} />
                      ) : (
                        <span className="text-sm text-gray-700">—</span>
                      )}
                    </td>

                    {/* Estágio */}
                    <td className="px-5 py-4">
                      {lead.stage ? (
                        <EstagioBadge value={lead.stage} />
                      ) : (
                        <span className="text-sm text-gray-700">—</span>
                      )}
                    </td>

                    {/* Data */}
                    <td className="px-5 py-4 text-xs text-gray-600 whitespace-nowrap">
                      {lead.created_at ? formatDate(lead.created_at) : '—'}
                    </td>

                    {/* Cliente */}
                    <td className="px-5 py-4" onClick={(e) => e.stopPropagation()}>
                      {convertedMap.has(lead.id) ? (
                        <Link
                          href={`/admin/clientes?clienteId=${convertedMap.get(lead.id)}`}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-lg border bg-emerald-500/10 border-emerald-500/20 text-emerald-400 text-[9px] font-black uppercase tracking-widest whitespace-nowrap hover:bg-emerald-500/20 transition-colors"
                        >
                          <Building2 className="w-2.5 h-2.5" />
                          Cliente
                        </Link>
                      ) : (
                        <span className="text-sm text-gray-700">—</span>
                      )}
                    </td>

                    {/* Ações */}
                    <td className="px-5 py-4" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => setEditLead(lead)}
                          className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 flex items-center justify-center text-gray-600 hover:text-white transition-all"
                          title="Editar"
                        >
                          <Pencil className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(lead)}
                          className="w-7 h-7 rounded-lg bg-white/5 hover:bg-red-500/10 border border-white/10 hover:border-red-500/20 flex items-center justify-center text-gray-600 hover:text-red-400 transition-all"
                          title="Excluir"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
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

      <LeadModal
        isOpen={!!editLead}
        onClose={() => setEditLead(null)}
        onSuccess={handleLeadEdited}
        lead={editLead ?? undefined}
      />

      {/* Delete confirmation */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-[#0C0C0C] border border-white/10 rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <h3 className="font-outfit text-base font-black text-white">Excluir Lead</h3>
                <p className="text-xs text-gray-600 mt-0.5">Esta ação não pode ser desfeita</p>
              </div>
            </div>
            <p className="text-sm text-gray-400 mb-6">
              Tem certeza que deseja excluir{' '}
              <span className="font-bold text-white">{deleteTarget.company_name}</span>?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
                className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-400 text-[11px] font-black uppercase tracking-widest hover:bg-white/10 hover:text-white transition-all disabled:opacity-60"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 px-4 py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 text-[11px] font-black uppercase tracking-widest transition-all disabled:opacity-60"
              >
                {deleting ? 'Excluindo...' : 'Excluir'}
              </button>
            </div>
          </div>
        </div>
      )}

      <LeadPanel
        lead={selectedLead}
        onClose={() => setSelectedLead(null)}
        onUpdate={handleLeadUpdate}
      />
    </div>
  );
}
