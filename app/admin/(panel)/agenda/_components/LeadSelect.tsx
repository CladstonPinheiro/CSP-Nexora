'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, X, Building2 } from 'lucide-react';
import { createSupabaseBrowserClient } from '@/lib/supabase';
import type { LeadOption } from './types';

const INPUT =
  'w-full bg-inset border border-border rounded-xl pl-10 pr-4 py-2.5 text-primary text-sm placeholder-gray-700 focus:outline-none focus:border-border-strong transition-all';

interface LeadSelectProps {
  value: LeadOption | null;
  onChange: (lead: LeadOption | null) => void;
}

export function LeadSelect({ value, onChange }: LeadSelectProps) {
  const [leads, setLeads] = useState<LeadOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    supabase
      .from('leads')
      .select('id, company_name, contact_name, phone')
      .order('company_name', { ascending: true })
      .then(({ data }) => {
        setLeads((data ?? []) as LeadOption[]);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const termo = query.trim().toLowerCase();
  const filtrados = termo
    ? leads.filter((l) =>
        `${l.company_name ?? ''} ${l.contact_name ?? ''}`.toLowerCase().includes(termo)
      )
    : leads;

  if (value) {
    return (
      <div className="flex items-center justify-between gap-3 bg-inset border border-border rounded-xl px-4 py-2.5">
        <div className="min-w-0">
          <p className="text-sm font-bold text-primary truncate">{value.company_name || '—'}</p>
          <p className="text-xs text-muted truncate">{value.contact_name || '—'}</p>
        </div>
        <button
          type="button"
          onClick={() => onChange(null)}
          className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 border border-border flex items-center justify-center text-muted hover:text-primary transition-all shrink-0"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative">
      <Search className="w-4 h-4 text-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
      <input
        type="text"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        placeholder="Buscar lead por empresa ou contato..."
        className={INPUT}
      />
      {open && (
        <div className="absolute z-10 mt-1.5 w-full max-h-56 overflow-y-auto bg-inset border border-border rounded-xl shadow-2xl">
          {loading ? (
            <p className="px-4 py-3 text-xs text-muted">Carregando leads...</p>
          ) : filtrados.length === 0 ? (
            <p className="px-4 py-3 text-xs text-muted">Nenhum lead encontrado</p>
          ) : (
            filtrados.slice(0, 30).map((lead) => (
              <button
                key={lead.id}
                type="button"
                onClick={() => {
                  onChange(lead);
                  setQuery('');
                  setOpen(false);
                }}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-left hover:bg-white/5 transition-colors border-b border-border last:border-0"
              >
                <Building2 className="w-3.5 h-3.5 text-muted shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm text-primary truncate">{lead.company_name || '—'}</p>
                  <p className="text-xs text-muted truncate">{lead.contact_name || '—'}</p>
                </div>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
