'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, SlidersHorizontal, InboxIcon, Pencil, Trash2, AlertTriangle, X } from 'lucide-react';
import { createSupabaseBrowserClient } from '@/lib/supabase';
import { ProjetoPanel } from './_components/ProjetoPanel';

type Projeto = {
  id: string;
  title: string | null;
  scope: string | null;
  status: string | null;
  client_id: string | null;
  setup_value: number | null;
  monthly_value: number | null;
  start_date: string | null;
  delivery_date: string | null;
  notes: string | null;
  created_at: string;
};

type ClienteOption = {
  id: string;
  company_name: string | null;
};

const statusConfig: Record<string, { label: string; style: string }> = {
  ativo:     { label: 'Ativo',     style: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20' },
  pausado:   { label: 'Pausado',   style: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/20' },
  concluido: { label: 'Concluído', style: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/20' },
  cancelado: { label: 'Cancelado', style: 'bg-red-500/15 text-red-400 border-red-500/20' },
};

const SELECT_CLASS = 'bg-inset border border-border rounded-xl px-3 py-2 text-secondary text-xs font-bold focus:outline-none focus:border-border-strong transition-all cursor-pointer min-w-[170px]';
const INPUT_CLASS = 'w-full bg-inset border border-border rounded-xl px-3 py-2.5 text-sm text-primary placeholder-[#384055] focus:outline-none focus:border-border-strong transition-all';

function StatusBadge({ value }: { value: string }) {
  const cfg = statusConfig[value];
  if (!cfg) return <span className="text-sm text-muted">—</span>;
  return <span className={`inline-flex px-2 py-1 rounded-lg border text-[9px] font-black uppercase tracking-widest whitespace-nowrap ${cfg.style}`}>{cfg.label}</span>;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' });
}

function formatCurrency(value: number | null) {
  if (!value) return '—';
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function ProjetoModal({ isOpen, onClose, onSuccess, projeto }: { isOpen: boolean; onClose: () => void; onSuccess: (p: Projeto) => void; projeto?: Projeto; }) {
  const [saving, setSaving] = useState(false);
  const [clientes, setClientes] = useState<ClienteOption[]>([]);
  const [form, setForm] = useState({ title: '', scope: '', status: 'ativo', client_id: '', setup_value: '', monthly_value: '', start_date: '', delivery_date: '', notes: '' });

  useEffect(() => {
    if (!isOpen) return;
    const supabase = createSupabaseBrowserClient();
    supabase.from('clientes').select('id, company_name').order('company_name').then(({ data }) => setClientes(data ?? []));
    if (projeto) {
      setForm({ title: projeto.title ?? '', scope: projeto.scope ?? '', status: projeto.status ?? 'ativo', client_id: projeto.client_id ?? '', setup_value: projeto.setup_value?.toString() ?? '', monthly_value: projeto.monthly_value?.toString() ?? '', start_date: projeto.start_date ?? '', delivery_date: projeto.delivery_date ?? '', notes: projeto.notes ?? '' });
    } else {
      setForm({ title: '', scope: '', status: 'ativo', client_id: '', setup_value: '', monthly_value: '', start_date: '', delivery_date: '', notes: '' });
    }
  }, [projeto, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!form.title.trim()) return;
    setSaving(true);
    const supabase = createSupabaseBrowserClient();
    const payload = {
      title: form.title,
      scope: form.scope || null,
      status: form.status,
      client_id: form.client_id || null,
      setup_value: form.setup_value ? parseFloat(form.setup_value) : null,
      monthly_value: form.monthly_value ? parseFloat(form.monthly_value) : null,
      start_date: form.start_date || null,
      delivery_date: form.delivery_date || null,
      notes: form.notes || null,
    };
    let data, error;
    if (projeto) {
      ({ data, error } = await supabase.from('projetos').update(payload).eq('id', projeto.id).select().single());
    } else {
      ({ data, error } = await supabase.from('projetos').insert(payload).select().single());
    }
    if (!error && data) onSuccess(data as Projeto);
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-surface border border-border rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-5 border-b border-border sticky top-0 bg-surface z-10">
          <h2 className="font-outfit text-base font-black text-primary">{projeto ? 'Editar Projeto' : 'Novo Projeto'}</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 border border-border flex items-center justify-center text-secondary hover:text-primary transition-all"><X className="w-4 h-4" /></button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="text-[9px] font-black uppercase tracking-widest text-secondary mb-1.5 block">Título *</label>
            <input className={INPUT_CLASS} placeholder="Nome do projeto" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
          </div>
          <div>
            <label className="text-[9px] font-black uppercase tracking-widest text-secondary mb-1.5 block">Cliente</label>
            <select className={INPUT_CLASS} value={form.client_id} onChange={e => setForm(f => ({ ...f, client_id: e.target.value }))} style={{ backgroundColor: 'var(--color-inset)' }}>
              <option value="">Nenhum cliente</option>
              {clientes.map(c => (
                <option key={c.id} value={c.id}>{c.company_name || 'Empresa sem nome'}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-[9px] font-black uppercase tracking-widest text-secondary mb-1.5 block">Escopo</label>
            <input className={INPUT_CLASS} placeholder="Descrição do escopo" value={form.scope} onChange={e => setForm(f => ({ ...f, scope: e.target.value }))} />
          </div>
          <div>
            <label className="text-[9px] font-black uppercase tracking-widest text-secondary mb-1.5 block">Status</label>
            <select className={INPUT_CLASS} value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} style={{ backgroundColor: 'var(--color-inset)' }}>
              {Object.entries(statusConfig).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[9px] font-black uppercase tracking-widest text-secondary mb-1.5 block">Setup (R$)</label>
              <input className={INPUT_CLASS} type="number" placeholder="0,00" value={form.setup_value} onChange={e => setForm(f => ({ ...f, setup_value: e.target.value }))} />
            </div>
            <div>
              <label className="text-[9px] font-black uppercase tracking-widest text-secondary mb-1.5 block">Mensalidade (R$)</label>
              <input className={INPUT_CLASS} type="number" placeholder="0,00" value={form.monthly_value} onChange={e => setForm(f => ({ ...f, monthly_value: e.target.value }))} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[9px] font-black uppercase tracking-widest text-secondary mb-1.5 block">Início</label>
              <input className={INPUT_CLASS} type="date" value={form.start_date} onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))} />
            </div>
            <div>
              <label className="text-[9px] font-black uppercase tracking-widest text-secondary mb-1.5 block">Entrega</label>
              <input className={INPUT_CLASS} type="date" value={form.delivery_date} onChange={e => setForm(f => ({ ...f, delivery_date: e.target.value }))} />
            </div>
          </div>
          <div>
            <label className="text-[9px] font-black uppercase tracking-widest text-secondary mb-1.5 block">Notas</label>
            <textarea className={`${INPUT_CLASS} resize-none`} rows={3} placeholder="Observações sobre o projeto" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
          </div>
        </div>
        <div className="flex gap-3 px-6 pb-6">
          <button onClick={onClose} disabled={saving} className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 border border-border text-secondary text-[11px] font-black uppercase tracking-widest hover:bg-white/10 hover:text-primary transition-all disabled:opacity-60">Cancelar</button>
          <button onClick={handleSubmit} disabled={saving || !form.title.trim()} className="flex-1 relative group disabled:opacity-60">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl blur opacity-40 group-hover:opacity-70 transition duration-300" />
            <div className="relative flex items-center justify-center bg-white text-black py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest">{saving ? 'Salvando...' : projeto ? 'Salvar' : 'Cadastrar'}</div>
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ProjetosPage() {
  const [projetos, setProjetos] = useState<Projeto[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editProjeto, setEditProjeto] = useState<Projeto | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Projeto | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [selectedProjeto, setSelectedProjeto] = useState<Projeto | null>(null);

  const fetchProjetos = useCallback(async () => {
    setLoading(true);
    const supabase = createSupabaseBrowserClient();
    const { data } = await supabase.from('projetos').select('*').order('created_at', { ascending: false });
    setProjetos(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchProjetos(); }, [fetchProjetos]);

  // Auto-open panel when navigating from clientes with ?projetoId=
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const projetoId = params.get('projetoId');
    if (projetoId && projetos.length > 0) {
      const found = projetos.find(p => p.id === projetoId);
      if (found) setSelectedProjeto(found);
    }
  }, [projetos]);

  const filtered = projetos.filter(p => !filterStatus || p.status === filterStatus);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.from('projetos').delete().eq('id', deleteTarget.id);
    if (!error) {
      setProjetos(prev => prev.filter(p => p.id !== deleteTarget.id));
      if (selectedProjeto?.id === deleteTarget.id) setSelectedProjeto(null);
    }
    setDeleteTarget(null);
    setDeleting(false);
  };

  return (
    <div className="p-8 min-h-screen">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="font-outfit text-3xl font-black tracking-tight text-primary">Projetos</h1>
          <p className="text-secondary text-sm mt-1">{loading ? 'Carregando...' : `${filtered.length}${filterStatus ? ` de ${projetos.length}` : ''} projeto${projetos.length !== 1 ? 's' : ''} cadastrado${projetos.length !== 1 ? 's' : ''}`}</p>
        </div>
        <button onClick={() => setModalOpen(true)} className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl blur opacity-40 group-hover:opacity-70 transition duration-300" />
          <div className="relative flex items-center gap-2 bg-white text-black px-5 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all"><Plus className="w-4 h-4" /> Novo Projeto</div>
        </button>
      </div>
      <div className="flex items-center gap-3 mb-5 flex-wrap">
        <SlidersHorizontal className="w-4 h-4 text-muted shrink-0" />
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className={SELECT_CLASS} style={{ backgroundColor: 'var(--color-inset)' }}>
          <option value="">Todos os status</option>
          {Object.entries(statusConfig).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
        {filterStatus && <button onClick={() => setFilterStatus('')} className="text-[11px] text-secondary hover:text-secondary transition-colors font-black uppercase tracking-widest">Limpar filtros</button>}
      </div>
      <div className="bg-surface border border-border rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead>
              <tr className="border-b border-border bg-white/[0.015]">
                {['Título', 'Escopo', 'Status', 'Setup', 'Mensalidade', 'Início', 'Entrega', 'Ações'].map(h => (
                  <th key={h} className="px-5 py-3.5 text-left text-[9px] font-black uppercase tracking-widest text-secondary">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-border">
                    {Array.from({ length: 8 }).map((_, j) => (
                      <td key={j} className="px-5 py-4"><div className="h-3 bg-white/5 rounded-lg animate-pulse" style={{ width: `${50 + (j * 17 + i * 11) % 40}%` }} /></td>
                    ))}
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr><td colSpan={8} className="py-20">
                  <div className="flex flex-col items-center justify-center text-center">
                    <div className="w-14 h-14 rounded-2xl bg-white/5 border border-border flex items-center justify-center mb-4"><InboxIcon className="w-6 h-6 text-muted" /></div>
                    <p className="text-sm font-bold text-secondary">Nenhum projeto encontrado</p>
                    <p className="text-xs text-muted mt-1">{filterStatus ? 'Tente ajustar os filtros' : 'Adicione o primeiro projeto pelo botão acima'}</p>
                  </div>
                </td></tr>
              ) : (
                filtered.map(projeto => (
                  <tr
                    key={projeto.id}
                    onClick={() => setSelectedProjeto(projeto)}
                    className={`border-b border-border last:border-0 cursor-pointer transition-colors ${
                      selectedProjeto?.id === projeto.id
                        ? 'bg-white/[0.04]'
                        : 'hover:bg-white/[0.025]'
                    }`}
                  >
                    <td className="px-5 py-4"><span className="text-sm font-bold text-primary">{projeto.title || '—'}</span></td>
                    <td className="px-5 py-4 text-sm text-secondary max-w-[200px] truncate">{projeto.scope || '—'}</td>
                    <td className="px-5 py-4">{projeto.status ? <StatusBadge value={projeto.status} /> : <span className="text-sm text-muted">—</span>}</td>
                    <td className="px-5 py-4 text-sm text-secondary">{formatCurrency(projeto.setup_value)}</td>
                    <td className="px-5 py-4 text-sm text-secondary">{formatCurrency(projeto.monthly_value)}</td>
                    <td className="px-5 py-4 text-xs text-secondary whitespace-nowrap">{projeto.start_date ? formatDate(projeto.start_date) : '—'}</td>
                    <td className="px-5 py-4 text-xs text-secondary whitespace-nowrap">{projeto.delivery_date ? formatDate(projeto.delivery_date) : '—'}</td>
                    <td className="px-5 py-4" onClick={e => e.stopPropagation()}>
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => setEditProjeto(projeto)} className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 border border-border hover:border-border-strong flex items-center justify-center text-secondary hover:text-primary transition-all"><Pencil className="w-3 h-3" /></button>
                        <button onClick={() => setDeleteTarget(projeto)} className="w-7 h-7 rounded-lg bg-white/5 hover:bg-red-500/10 border border-border hover:border-red-500/20 flex items-center justify-center text-secondary hover:text-red-400 transition-all"><Trash2 className="w-3 h-3" /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      <ProjetoModal isOpen={modalOpen} onClose={() => setModalOpen(false)} onSuccess={p => { setProjetos(prev => [p, ...prev]); setModalOpen(false); }} />
      <ProjetoModal isOpen={!!editProjeto} onClose={() => setEditProjeto(null)} onSuccess={p => { setProjetos(prev => prev.map(x => x.id === p.id ? p : x)); setEditProjeto(null); }} projeto={editProjeto ?? undefined} />
      {deleteTarget && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-surface border border-border rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0"><AlertTriangle className="w-5 h-5 text-red-400" /></div>
              <div>
                <h3 className="font-outfit text-base font-black text-primary">Excluir Projeto</h3>
                <p className="text-xs text-secondary mt-0.5">Esta ação não pode ser desfeita</p>
              </div>
            </div>
            <p className="text-sm text-secondary mb-6">Tem certeza que deseja excluir <span className="font-bold text-primary">{deleteTarget.title}</span>?</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteTarget(null)} disabled={deleting} className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 border border-border text-secondary text-[11px] font-black uppercase tracking-widest hover:bg-white/10 hover:text-primary transition-all disabled:opacity-60">Cancelar</button>
              <button onClick={handleDelete} disabled={deleting} className="flex-1 px-4 py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 text-[11px] font-black uppercase tracking-widest transition-all disabled:opacity-60">{deleting ? 'Excluindo...' : 'Excluir'}</button>
            </div>
          </div>
        </div>
      )}
      <ProjetoPanel
        projeto={selectedProjeto}
        onClose={() => setSelectedProjeto(null)}
      />
    </div>
  );
}
