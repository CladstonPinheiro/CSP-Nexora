'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  X,
  Phone,
  MapPin,
  Globe,
  Briefcase,
  Star,
  MessageSquare,
  Search,
  Calendar,
  Instagram,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Store,
  User,
  UserCog,
  IdCard,
} from 'lucide-react';
import { updateLeadStatus, updateLeadFields } from '../actions';
import { STATUS_ORDER, statusConfig, type LeadProspeccao, type LeadProspeccaoStatus } from './types';
import { WhatsAppButton } from './WhatsAppButton';

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function InfoRow({
  icon: Icon,
  label,
  value,
  href,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  href?: string;
}) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3">
      <div className="w-7 h-7 rounded-lg bg-white/5 border border-border flex items-center justify-center shrink-0 mt-0.5">
        <Icon className="w-3.5 h-3.5 text-muted" />
      </div>
      <div className="min-w-0">
        <p className="text-[9px] font-black uppercase tracking-widest text-muted">{label}</p>
        {href ? (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-cyan-400 hover:text-cyan-300 mt-0.5 break-words underline underline-offset-2"
          >
            {value}
          </a>
        ) : (
          <p className="text-sm text-primary mt-0.5 break-words">{value}</p>
        )}
      </div>
    </div>
  );
}

function EditableField({
  icon: Icon,
  label,
  value,
  onChange,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-7 h-7 rounded-lg bg-white/5 border border-border flex items-center justify-center shrink-0 mt-0.5">
        <Icon className="w-3.5 h-3.5 text-muted" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[9px] font-black uppercase tracking-widest text-muted mb-1">{label}</p>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-inset border border-border rounded-xl px-3 py-2 text-sm text-primary focus:outline-none focus:border-border-strong transition-all"
          style={{ backgroundColor: 'var(--color-inset)' }}
        />
      </div>
    </div>
  );
}

export function LeadDetailModal({
  lead,
  onClose,
}: {
  lead: LeadProspeccao;
  onClose: () => void;
}) {
  const router = useRouter();
  const [status, setStatus] = useState<LeadProspeccaoStatus>(lead.status);
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  const [formFields, setFormFields] = useState({
    title: lead.title,
    phone: lead.phone ?? '',
    address: lead.address ?? '',
    website: lead.website ?? '',
    category_name: lead.category_name ?? '',
    nome_contato: lead.nome_contato ?? '',
    cargo_contato: lead.cargo_contato ?? '',
    nome_responsavel: lead.nome_responsavel ?? '',
    cargo_responsavel: lead.cargo_responsavel ?? '',
  });
  const [fieldsSaveState, setFieldsSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  async function handleStatusChange(newStatus: LeadProspeccaoStatus) {
    setStatus(newStatus);
    setSaveState('saving');
    const { error } = await updateLeadStatus(lead.id, newStatus);
    if (error) {
      setSaveState('error');
      return;
    }
    setSaveState('saved');
    router.refresh();
  }

  function updateField(field: keyof typeof formFields, value: string) {
    setFormFields((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSaveFields() {
    setFieldsSaveState('saving');
    const { error } = await updateLeadFields(lead.id, {
      title: formFields.title.trim(),
      phone: formFields.phone.trim() || null,
      address: formFields.address.trim() || null,
      website: formFields.website.trim() || null,
      category_name: formFields.category_name.trim() || null,
      nome_contato: formFields.nome_contato.trim() || null,
      cargo_contato: formFields.cargo_contato.trim() || null,
      nome_responsavel: formFields.nome_responsavel.trim() || null,
      cargo_responsavel: formFields.cargo_responsavel.trim() || null,
    });
    if (error) {
      setFieldsSaveState('error');
      return;
    }
    setFieldsSaveState('saved');
    router.refresh();
  }

  return (
    <div
      className="fixed inset-0 z-[200] flex items-start justify-center overflow-y-auto bg-black/70 backdrop-blur-sm p-4 pt-8"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-surface border border-border rounded-2xl overflow-hidden shadow-2xl mb-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabeçalho */}
        <div className="flex items-start justify-between px-6 py-5 border-b border-border">
          <div>
            <h2 className="text-xl font-black text-primary tracking-tight">{lead.title}</h2>
            {lead.category_name && <p className="text-sm text-muted mt-0.5">{lead.category_name}</p>}
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 border border-border flex items-center justify-center text-muted hover:text-primary transition-all shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-6 py-5 flex flex-col gap-6">
          {/* Status */}
          <div>
            <p className="text-[9px] font-black uppercase tracking-widest text-muted mb-2">Status</p>
            <div className="flex items-center gap-3">
              <select
                value={status}
                onChange={(e) => handleStatusChange(e.target.value as LeadProspeccaoStatus)}
                className="bg-inset border border-border rounded-xl px-3 py-2 text-secondary text-xs font-bold focus:outline-none focus:border-border-strong transition-all cursor-pointer min-w-[170px]"
                style={{ backgroundColor: 'var(--color-inset)' }}
              >
                {STATUS_ORDER.map((s) => (
                  <option key={s} value={s}>
                    {statusConfig[s].label}
                  </option>
                ))}
              </select>
              {saveState === 'saving' && <Loader2 className="w-4 h-4 text-muted animate-spin" />}
              {saveState === 'saved' && (
                <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Salvo
                </span>
              )}
              {saveState === 'error' && (
                <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-red-400">
                  <AlertTriangle className="w-3.5 h-3.5" /> Erro ao salvar
                </span>
              )}
            </div>
          </div>

          <div className="h-px bg-white/5" />

          {/* Campos editáveis */}
          <div>
            <p className="text-[9px] font-black uppercase tracking-widest text-muted mb-3">Editar Informações</p>
            <div className="flex flex-col gap-4">
              <EditableField icon={Store} label="Nome / Título" value={formFields.title} onChange={(v) => updateField('title', v)} />
              <EditableField icon={Phone} label="Telefone" value={formFields.phone} onChange={(v) => updateField('phone', v)} />
              <EditableField icon={MapPin} label="Endereço" value={formFields.address} onChange={(v) => updateField('address', v)} />
              <EditableField icon={Globe} label="Website" value={formFields.website} onChange={(v) => updateField('website', v)} />
              <EditableField icon={Briefcase} label="Categoria" value={formFields.category_name} onChange={(v) => updateField('category_name', v)} />
            </div>

            <p className="text-[9px] font-black uppercase tracking-widest text-muted mb-3 mt-6">Contato na Prospecção</p>
            <div className="grid grid-cols-2 gap-4">
              <EditableField icon={User} label="Nome do Contato" value={formFields.nome_contato} onChange={(v) => updateField('nome_contato', v)} />
              <EditableField icon={IdCard} label="Cargo do Contato" value={formFields.cargo_contato} onChange={(v) => updateField('cargo_contato', v)} />
              <EditableField icon={UserCog} label="Nome do Responsável" value={formFields.nome_responsavel} onChange={(v) => updateField('nome_responsavel', v)} />
              <EditableField icon={IdCard} label="Cargo do Responsável" value={formFields.cargo_responsavel} onChange={(v) => updateField('cargo_responsavel', v)} />
            </div>

            <div className="flex items-center gap-3 mt-4">
              <button
                onClick={handleSaveFields}
                disabled={fieldsSaveState === 'saving'}
                className="px-4 py-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[11px] font-black uppercase tracking-widest hover:bg-cyan-500/20 transition-all disabled:opacity-50"
              >
                Salvar
              </button>
              {fieldsSaveState === 'saving' && <Loader2 className="w-4 h-4 text-muted animate-spin" />}
              {fieldsSaveState === 'saved' && (
                <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Salvo
                </span>
              )}
              {fieldsSaveState === 'error' && (
                <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-red-400">
                  <AlertTriangle className="w-3.5 h-3.5" /> Erro ao salvar
                </span>
              )}
            </div>
          </div>

          <div className="h-px bg-white/5" />

          {/* Campos somente leitura */}
          <div className="flex flex-col gap-4">
            <InfoRow icon={Star} label="Nota / Avaliações" value={lead.total_score != null ? `${lead.total_score} ⭐ (${lead.reviews_count ?? 0} avaliações)` : ''} />
            <InfoRow icon={Search} label="Termo de Busca" value={lead.search_term ?? ''} />
            <InfoRow icon={MapPin} label="Google Maps" value={lead.maps_url ?? ''} href={lead.maps_url ?? undefined} />
            <InfoRow icon={Instagram} label="Instagram" value={lead.instagram_url ?? ''} href={lead.instagram_url ?? undefined} />
            <InfoRow icon={Calendar} label="Capturado em" value={formatDate(lead.created_at)} />
          </div>

          <div className="h-px bg-white/5" />

          <WhatsAppButton
            phone={lead.phone}
            label="Chamar no WhatsApp"
            className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all bg-green-500/10 border border-green-500/20 text-green-400 hover:bg-green-500/20"
          />
          {!lead.phone && (
            <p className="text-xs text-muted text-center -mt-3">Sem telefone cadastrado</p>
          )}
        </div>
      </div>
    </div>
  );
}
