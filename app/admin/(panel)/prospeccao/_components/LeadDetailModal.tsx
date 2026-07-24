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
} from 'lucide-react';
import { updateLeadStatus } from '../actions';
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

          {/* Campos */}
          <div className="flex flex-col gap-4">
            <InfoRow icon={Phone} label="Telefone" value={lead.phone ?? ''} />
            <InfoRow icon={MapPin} label="Endereço" value={lead.address ?? ''} />
            <InfoRow icon={Globe} label="Website" value={lead.website ?? ''} href={lead.website ?? undefined} />
            <InfoRow icon={Briefcase} label="Categoria" value={lead.category_name ?? ''} />
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
