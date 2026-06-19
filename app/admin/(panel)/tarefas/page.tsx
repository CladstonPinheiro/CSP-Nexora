'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, SlidersHorizontal, InboxIcon, Pencil, Trash2, AlertTriangle, X, CheckCircle2, Circle } from 'lucide-react';
import { createSupabaseBrowserClient } from '@/lib/supabase';

type Tarefa = {
  id: string;
  lead_id: string | null;
  client_id: string | null;
  type: string | null;
  title: string | null;
  due_at: string | null;
  channel: string | null;
  done: boolean;
  created_at: string;
  responsavel_id: string | null;
};

const typeConfig: Record<string, { label: string; style: string }> = {
  ligacao:  { label: 'Ligação',  style: 'bg-blue-500/15 text-blue-400 border-blue-500/20' },
  email:    { label: 'Email',    style: 'bg-purple-500/15 text-purple-400 border-purple-500/20' },
  reuniao:  { label: 'Reunião',  style: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/20' },
  entrega:  { label: 'Entrega',  style: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20' },
  outros:   { label: 'Outros',   style: 'bg-gray-500/15 text-[#F6F6F8] border-gray-500/20' },
};

const SELECT_CLASS = 'bg-[#0D0D0D] border border-white/10 rounded-xl px-3 py-2 text-[#F6F6F8] text-xs font-bold focus:outline-none focus:border-cyan-500/40 transition-all cursor-pointer min-w-[170px]';
const INPUT_CLASS = 'w-full bg-[#0D0D0D] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder-[#F6F6F8] focus:outline-none focus:border-cyan-500/40 transition-all';

function TypeBadge({ value }: { value: string }) {
  const cfg = typeConfig[value];
  if (!cfg) return <span className="text-sm text-gray-700">—</span>;
  return <span className={`inline-flex px-2 py-1 rounded-lg border text-[9px] font-black uppercase tracking-widest whitespace-nowrap ${cfg.style}`}>{cfg.label}</span>;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' });
}

function TarefaModal({ isOpen, onClose, onSuccess, tarefa }: { isOpen: boolean; onClose: () => void; onSuccess: (t: Tarefa) => void; tarefa?: Tarefa; }) {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: '', type: '', channel: '', due_at: '', done: false });

  useEffect(() => {
    if (tarefa) {
      setForm({ title: tarefa.title ?? '', type: tarefa.type ?? '', channel: tarefa.channel ?? '', due_at: tarefa.due_at ? tarefa.due_at.slice(0, 16) : '', done: tarefa.done ?? false });
    } else {
      setForm({ title: '', type: '', channel: '', due_at: '', done: false });
    }
  }, [tarefa, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!form.title.trim()) return;
    setSaving(true);
    const supabase = createSupabaseBrowserClient();
    const payload = { title: form.title, type: form.type || null, channel: form.channel || null, due_at: form.due_at || null, done: form.done };
    let data, error;
    if (tarefa) {
      ({ data, error } = await supabase.from('tarefas').update(payload).eq('id', tarefa.id).select().single());
    } else {
      ({ data, error } = await supabase.from('tarefas').insert(payload).select().single());
    }
    if (!error && data) onSuccess(data as Tarefa);
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#0C0C0C] border border-white/10 rounded-2xl shadow-2xl">
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/5">
          <h2 className="font-outfit text-base font-black text-white">{tarefa ? 'Editar Tarefa' : 'Nova Tarefa'}</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-[#F6F6F8] hover:text-white transition-all"><X className="w-4 h-4" /></button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="text-[9px] font-black uppercase tracking-widest text-[#F6F6F8] mb-1.5 block">Título *</label>
            <input className={INPUT_CLASS} placeholder="Descrição da tarefa" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[9px] font-black uppercase tracking-widest text-[#F6F6F8] mb-1.5 block">Tipo</label>
              <select className={INPUT_CLASS} value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} style={{ backgroundColor: '#0D0D0D' }}>
                <option value="">Selecione</option>
                {Object.entries(typeConfig).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[9px] font-black uppercase tracking-widest text-[#F6F6F8] mb-1.5 block">Canal</label>
              <input className={INPUT_CLASS} placeholder="WhatsApp, Email..." value={form.channel} onChange={e => setForm(f => ({ ...f, channel: e.target.value }))} />
            </div>
          </div>
          <div>
            <label className="text-[9px] font-black uppercase tracking-widest text-[#F6F6F8] mb-1.5 block">Prazo</label>
            <input className={INPUT_CLASS} type="datetime-local" value={form.due_at} onChange={e => setForm(f => ({ ...f, due_at: e.target.value }))} />
          </div>
          <label className="flex items-center gap-3 cursor-pointer group">
            <div onClick={() => setForm(f => ({ ...f, done: !f.done }))} className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${form.done ? 'bg-emerald-500/20 border-emerald-500/40' : 'bg-white/5 border-white/10'}`}>
              {form.done && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
            </div>
            <span className="text-sm text-[#F6F6F8] group-hover:text-[#F6F6F8] transition-colors">Marcar como concluída</span>
          </label>
        </div>
        <div className="flex gap-3 px-6 pb-6">
          <button onClick={onClose} disabled={saving} className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-[#F6F6F8] text-[11px] font-black uppercase tracking-widest hover:bg-white/10 hover:text-white transition-all disabled:opacity-60">Cancelar</button>
          <button onClick={handleSubmit} disabled={saving || !form.title.trim()} className="flex-1 relative group disabled:opacity-60">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl blur opacity-40 group-hover:opacity-70 transition duration-300" />
            <div className="relative flex items-center justify-center bg-white text-black py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest">{saving ? 'Salvando...' : tarefa ? 'Salvar' : 'Cadastrar'}</div>
          </button>
        </div>
      </div>
    </div>
  );
}

export default function TarefasPage() {
  const [tarefas, setTarefas] = useState<Tarefa[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('');
  const [filterDone, setFilterDone] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarefa, setEditTarefa] = useState<Tarefa | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Tarefa | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchTarefas = useCallback(async () => {
    setLoading(true);
    const supabase = createSupabaseBrowserClient();
    const { data } = await supabase.from('tarefas').select('*').order('due_at', { ascending: true });
    setTarefas(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchTarefas(); }, [fetchTarefas]);

  const filtered = tarefas.filter(t => {
    if (filterType && t.type !== filterType) return false;
    if (filterDone === 'pendente' && t.done) return false;
    if (filterDone === 'concluida' && !t.done) return false;
    return true;
  });

  const toggleDone = async (tarefa: Tarefa) => {
    const supabase = createSupabaseBrowserClient();
    const { data, error } = await supabase.from('tarefas').update({ done: !tarefa.done }).eq('id', tarefa.id).select().single();
    if (!error && data) setTarefas(prev => prev.map(t => t.id === tarefa.id ? data as Tarefa : t));
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.from('tarefas').delete().eq('id', deleteTarget.id);
    if (!error) setTarefas(prev => prev.filter(t => t.id !== deleteTarget.id));
    setDeleteTarget(null);
    setDeleting(false);
  };

  const hasFilters = filterType || filterDone;

  return (
    <div className="p-8 min-h-screen">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="font-outfit text-3xl font-black tracking-tight text-white">Tarefas</h1>
          <p className="text-[#F6F6F8] text-sm mt-1">{loading ? 'Carregando...' : `${filtered.length}${hasFilters ? ` de ${tarefas.length}` : ''} tarefa${tarefas.length !== 1 ? 's' : ''}`}</p>
        </div>
        <button onClick={() => setModalOpen(true)} className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl blur opacity-40 group-hover:opacity-70 transition duration-300" />
          <div className="relative flex items-center gap-2 bg-white text-black px-5 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all"><Plus className="w-4 h-4" /> Nova Tarefa</div>
        </button>
      </div>
      <div className="flex items-center gap-3 mb-5 flex-wrap">
        <SlidersHorizontal className="w-4 h-4 text-gray-700 shrink-0" />
        <select value={filterType} onChange={e => setFilterType(e.target.value)} className={SELECT_CLASS} style={{ backgroundColor: '#0D0D0D' }}>
          <option value="">Todos os tipos</option>
          {Object.entries(typeConfig).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
        <select value={filterDone} onChange={e => setFilterDone(e.target.value)} className={SELECT_CLASS} style={{ backgroundColor: '#0D0D0D' }}>
          <option value="">Todas as tarefas</option>
          <option value="pendente">Pendentes</option>
          <option value="concluida">Concluídas</option>
        </select>
        {hasFilters && <button onClick={() => { setFilterType(''); setFilterDone(''); }} className="text-[11px] text-[#F6F6F8] hover:text-[#F6F6F8] transition-colors font-black uppercase tracking-widest">Limpar filtros</button>}
      </div>
      <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.015]">
                {['', 'Título', 'Tipo', 'Canal', 'Prazo', 'Status', 'Ações'].map(h => (
                  <th key={h} className="px-5 py-3.5 text-left text-[9px] font-black uppercase tracking-widest text-[#F6F6F8]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-white/5">
                    {Array.from({ length: 7 }).map((_, j) => (
                      <td key={j} className="px-5 py-4"><div className="h-3 bg-white/5 rounded-lg animate-pulse" style={{ width: `${50 + (j * 17 + i * 11) % 40}%` }} /></td>
                    ))}
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr><td colSpan={7} className="py-20">
                  <div className="flex flex-col items-center justify-center text-center">
                    <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-4"><InboxIcon className="w-6 h-6 text-gray-700" /></div>
                    <p className="text-sm font-bold text-[#F6F6F8]">Nenhuma tarefa encontrada</p>
                    <p className="text-xs text-gray-700 mt-1">{hasFilters ? 'Tente ajustar os filtros' : 'Adicione a primeira tarefa pelo botão acima'}</p>
                  </div>
                </td></tr>
              ) : (
                filtered.map(tarefa => (
                  <tr key={tarefa.id} className={`border-b border-white/5 last:border-0 transition-colors hover:bg-white/[0.025] ${tarefa.done ? 'opacity-50' : ''}`}>
                    <td className="px-5 py-4 w-10">
                      <button onClick={() => toggleDone(tarefa)} className="text-[#F6F6F8] hover:text-emerald-400 transition-colors">
                        {tarefa.done ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Circle className="w-4 h-4" />}
                      </button>
                    </td>
                    <td className="px-5 py-4"><span className={`text-sm font-bold ${tarefa.done ? 'line-through text-[#F6F6F8]' : 'text-white'}`}>{tarefa.title || '—'}</span></td>
                    <td className="px-5 py-4">{tarefa.type ? <TypeBadge value={tarefa.type} /> : <span className="text-sm text-gray-700">—</span>}</td>
                    <td className="px-5 py-4 text-sm text-[#F6F6F8]">{tarefa.channel || '—'}</td>
                    <td className="px-5 py-4 text-xs text-[#F6F6F8] whitespace-nowrap">{tarefa.due_at ? formatDate(tarefa.due_at) : '—'}</td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex px-2 py-1 rounded-lg border text-[9px] font-black uppercase tracking-widest whitespace-nowrap ${tarefa.done ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20' : 'bg-yellow-500/15 text-yellow-400 border-yellow-500/20'}`}>
                        {tarefa.done ? 'Concluída' : 'Pendente'}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => setEditTarefa(tarefa)} className="w-7 h-7 rounded-lg bg-white/5 hover:bg-cyan-500/10 border border-white/10 hover:border-cyan-500/20 flex items-center justify-center text-[#F6F6F8] hover:text-cyan-400 transition-all"><Pencil className="w-3 h-3" /></button>
                        <button onClick={() => setDeleteTarget(tarefa)} className="w-7 h-7 rounded-lg bg-white/5 hover:bg-red-500/10 border border-white/10 hover:border-red-500/20 flex items-center justify-center text-[#F6F6F8] hover:text-red-400 transition-all"><Trash2 className="w-3 h-3" /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      <TarefaModal isOpen={modalOpen} onClose={() => setModalOpen(false)} onSuccess={t => { setTarefas(prev => [t, ...prev]); setModalOpen(false); }} />
      <TarefaModal isOpen={!!editTarefa} onClose={() => setEditTarefa(null)} onSuccess={t => { setTarefas(prev => prev.map(x => x.id === t.id ? t : x)); setEditTarefa(null); }} tarefa={editTarefa ?? undefined} />
      {deleteTarget && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-[#0C0C0C] border border-white/10 rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0"><AlertTriangle className="w-5 h-5 text-red-400" /></div>
              <div>
                <h3 className="font-outfit text-base font-black text-white">Excluir Tarefa</h3>
                <p className="text-xs text-[#F6F6F8] mt-0.5">Esta ação não pode ser desfeita</p>
              </div>
            </div>
            <p className="text-sm text-[#F6F6F8] mb-6">Tem certeza que deseja excluir <span className="font-bold text-white">{deleteTarget.title}</span>?</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteTarget(null)} disabled={deleting} className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-[#F6F6F8] text-[11px] font-black uppercase tracking-widest hover:bg-white/10 hover:text-white transition-all disabled:opacity-60">Cancelar</button>
              <button onClick={handleDelete} disabled={deleting} className="flex-1 px-4 py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 text-[11px] font-black uppercase tracking-widest transition-all disabled:opacity-60">{deleting ? 'Excluindo...' : 'Excluir'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}