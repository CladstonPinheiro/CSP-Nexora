'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, SlidersHorizontal, InboxIcon, Pencil, Trash2, AlertTriangle, X } from 'lucide-react';
import { createSupabaseBrowserClient } from '@/lib/supabase';
import { ClientePanel } from './_components/ClientePanel';

type Cliente = {
  id: string;
  lead_id: string | null;
  company_name: string | null;
  contact_name: string | null;
  phone: string | null;
  email: string | null;
  niche: string | null;
  status: string | null;
  started_at: string | null;
};

const statusConfig: Record<string, { label: string; style: string }> = {
  ativo:     { label: 'Ativo',     style: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20' },
  pausado:   { label: 'Pausado',   style: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/20' },
  encerrado: { label: 'Encerrado', style: 'bg-red-500/15 text-red-400 border-red-500/20' },
};

const nichoLabel: Record<string, string> = {
  saude:       'Saúde',
  educacao:    'Educação',
  tecnologia:  'Tecnologia',
  varejo:      'Varejo',
  servicos:    'Serviços',
  industria:   'Indústria',
  imobiliario: 'Imobiliário',
  juridico:    'Jurídico',
  outros:      'Outros',
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

function ClienteModal({ isOpen, onClose, onSuccess, cliente }: { isOpen: boolean; onClose: () => void; onSuccess: (c: Cliente) => void; cliente?: Cliente; }) {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ company_name: '', contact_name: '', phone: '', email: '', niche: '', status: 'ativo' });

  useEffect(() => {
    if (cliente) {
      setForm({ company_name: cliente.company_name ?? '', contact_name: cliente.contact_name ?? '', phone: cliente.phone ?? '', email: cliente.email ?? '', niche: cliente.niche ?? '', status: cliente.status ?? 'ativo' });
    } else {
      setForm({ company_name: '', contact_name: '', phone: '', email: '', niche: '', status: 'ativo' });
    }
  }, [cliente, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!form.company_name.trim()) return;
    setSaving(true);
    const supabase = createSupabaseBrowserClient();
    let data, error;
    if (cliente) {
      ({ data, error } = await supabase.from('clientes').update(form).eq('id', cliente.id).select().single());
    } else {
      ({ data, error } = await supabase.from('clientes').insert(form).select().single());
    }
    if (!error && data) onSuccess(data as Cliente);
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-surface border border-border rounded-2xl shadow-2xl">
        <div className="flex items-center justify-between px-6 py-5 border-b border-border">
          <h2 className="font-outfit text-base font-black text-primary">{cliente ? 'Editar Cliente' : 'Novo Cliente'}</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 border border-border flex items-center justify-center text-secondary hover:text-primary transition-all"><X className="w-4 h-4" /></button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="text-[9px] font-black uppercase tracking-widest text-secondary mb-1.5 block">Empresa *</label>
            <input className={INPUT_CLASS} placeholder="Nome da empresa" value={form.company_name} onChange={e => setForm(f => ({ ...f, company_name: e.target.value }))} />
          </div>
          <div>
            <label className="text-[9px] font-black uppercase tracking-widest text-secondary mb-1.5 block">Contato</label>
            <input className={INPUT_CLASS} placeholder="Nome do contato" value={form.contact_name} onChange={e => setForm(f => ({ ...f, contact_name: e.target.value }))} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[9px] font-black uppercase tracking-widest text-secondary mb-1.5 block">Telefone</label>
              <input className={INPUT_CLASS} placeholder="(11) 99999-9999" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
            </div>
            <div>
              <label className="text-[9px] font-black uppercase tracking-widest text-secondary mb-1.5 block">Email</label>
              <input className={INPUT_CLASS} type="email" placeholder="email@empresa.com" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[9px] font-black uppercase tracking-widest text-secondary mb-1.5 block">Nicho</label>
              <select className={INPUT_CLASS} value={form.niche} onChange={e => setForm(f => ({ ...f, niche: e.target.value }))} style={{ backgroundColor: 'var(--color-inset)' }}>
                <option value="">Selecione</option>
                {Object.entries(nichoLabel).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[9px] font-black uppercase tracking-widest text-secondary mb-1.5 block">Status</label>
              <select className={INPUT_CLASS} value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} style={{ backgroundColor: 'var(--color-inset)' }}>
                {Object.entries(statusConfig).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
            </div>
          </div>
        </div>
        <div className="flex gap-3 px-6 pb-6">
          <button onClick={onClose} disabled={saving} className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 border border-border text-secondary text-[11px] font-black uppercase tracking-widest hover:bg-white/10 hover:text-primary transition-all disabled:opacity-60">Cancelar</button>
          <button onClick={handleSubmit} disabled={saving || !form.company_name.trim()} className="flex-1 relative group disabled:opacity-60">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl blur opacity-40 group-hover:opacity-70 transition duration-300" />
            <div className="relative flex items-center justify-center bg-white text-black py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest">{saving ? 'Salvando...' : cliente ? 'Salvar' : 'Cadastrar'}</div>
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editCliente, setEditCliente] = useState<Cliente | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Cliente | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null);

  const fetchClientes = useCallback(async () => {
    setLoading(true);
    const supabase = createSupabaseBrowserClient();
    const { data } = await supabase.from('clientes').select('*').order('started_at', { ascending: false });
    setClientes(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchClientes(); }, [fetchClientes]);

  // Auto-open panel when navigating from leads with ?clienteId=
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const clienteId = params.get('clienteId');
    if (clienteId && clientes.length > 0) {
      const found = clientes.find(c => c.id === clienteId);
      if (found) setSelectedCliente(found);
    }
  }, [clientes]);

  const filtered = clientes.filter(c => !filterStatus || c.status === filterStatus);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.from('clientes').delete().eq('id', deleteTarget.id);
    if (!error) {
      setClientes(prev => prev.filter(c => c.id !== deleteTarget.id));
      if (selectedCliente?.id === deleteTarget.id) setSelectedCliente(null);
    }
    setDeleteTarget(null);
    setDeleting(false);
  };

  return (
    <div className="p-8 min-h-screen">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="font-outfit text-3xl font-black tracking-tight text-primary">Clientes</h1>
          <p className="text-secondary text-sm mt-1">{loading ? 'Carregando...' : `${filtered.length}${filterStatus ? ` de ${clientes.length}` : ''} cliente${clientes.length !== 1 ? 's' : ''} cadastrado${clientes.length !== 1 ? 's' : ''}`}</p>
        </div>
        <button onClick={() => setModalOpen(true)} className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl blur opacity-40 group-hover:opacity-70 transition duration-300" />
          <div className="relative flex items-center gap-2 bg-white text-black px-5 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all"><Plus className="w-4 h-4" /> Novo Cliente</div>
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
          <table className="w-full min-w-[800px]">
            <thead>
              <tr className="border-b border-border bg-white/[0.015]">
                {['Empresa', 'Contato', 'Nicho', 'Telefone', 'Email', 'Status', 'Desde', 'Ações'].map(h => (
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
                    <p className="text-sm font-bold text-secondary">Nenhum cliente encontrado</p>
                    <p className="text-xs text-muted mt-1">{filterStatus ? 'Tente ajustar os filtros' : 'Adicione o primeiro cliente pelo botão acima'}</p>
                  </div>
                </td></tr>
              ) : (
                filtered.map(cliente => (
                  <tr
                    key={cliente.id}
                    onClick={() => setSelectedCliente(cliente)}
                    className={`border-b border-border last:border-0 cursor-pointer transition-colors ${
                      selectedCliente?.id === cliente.id
                        ? 'bg-white/[0.04]'
                        : 'hover:bg-white/[0.025]'
                    }`}
                  >
                    <td className="px-5 py-4"><span className="text-sm font-bold text-primary">{cliente.company_name || '—'}</span></td>
                    <td className="px-5 py-4 text-sm text-secondary">{cliente.contact_name || '—'}</td>
                    <td className="px-5 py-4 text-sm text-secondary">{cliente.niche ? (nichoLabel[cliente.niche] ?? cliente.niche) : '—'}</td>
                    <td className="px-5 py-4 text-sm text-secondary">{cliente.phone || '—'}</td>
                    <td className="px-5 py-4 text-sm text-secondary">{cliente.email || '—'}</td>
                    <td className="px-5 py-4">{cliente.status ? <StatusBadge value={cliente.status} /> : <span className="text-sm text-muted">—</span>}</td>
                    <td className="px-5 py-4 text-xs text-secondary whitespace-nowrap">{cliente.started_at ? formatDate(cliente.started_at) : '—'}</td>
                    <td className="px-5 py-4" onClick={e => e.stopPropagation()}>
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => setEditCliente(cliente)} className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 border border-border hover:border-border-strong flex items-center justify-center text-secondary hover:text-primary transition-all"><Pencil className="w-3 h-3" /></button>
                        <button onClick={() => setDeleteTarget(cliente)} className="w-7 h-7 rounded-lg bg-white/5 hover:bg-red-500/10 border border-border hover:border-red-500/20 flex items-center justify-center text-secondary hover:text-red-400 transition-all"><Trash2 className="w-3 h-3" /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      <ClienteModal isOpen={modalOpen} onClose={() => setModalOpen(false)} onSuccess={c => { setClientes(prev => [c, ...prev]); setModalOpen(false); }} />
      <ClienteModal isOpen={!!editCliente} onClose={() => setEditCliente(null)} onSuccess={c => { setClientes(prev => prev.map(x => x.id === c.id ? c : x)); setEditCliente(null); }} cliente={editCliente ?? undefined} />
      {deleteTarget && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-surface border border-border rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0"><AlertTriangle className="w-5 h-5 text-red-400" /></div>
              <div>
                <h3 className="font-outfit text-base font-black text-primary">Excluir Cliente</h3>
                <p className="text-xs text-secondary mt-0.5">Esta ação não pode ser desfeita</p>
              </div>
            </div>
            <p className="text-sm text-secondary mb-6">Tem certeza que deseja excluir <span className="font-bold text-primary">{deleteTarget.company_name}</span>?</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteTarget(null)} disabled={deleting} className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 border border-border text-secondary text-[11px] font-black uppercase tracking-widest hover:bg-white/10 hover:text-primary transition-all disabled:opacity-60">Cancelar</button>
              <button onClick={handleDelete} disabled={deleting} className="flex-1 px-4 py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 text-[11px] font-black uppercase tracking-widest transition-all disabled:opacity-60">{deleting ? 'Excluindo...' : 'Excluir'}</button>
            </div>
          </div>
        </div>
      )}
      <ClientePanel
        cliente={selectedCliente}
        onClose={() => setSelectedCliente(null)}
      />
    </div>
  );
}
