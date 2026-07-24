'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { SlidersHorizontal } from 'lucide-react';
import { STATUS_ORDER, statusConfig } from './types';

const SELECT_CLASS =
  'bg-inset border border-border rounded-xl px-3 py-2 text-secondary text-xs font-bold focus:outline-none focus:border-border-strong transition-all cursor-pointer min-w-[170px]';

export function Filters({ searchTerms }: { searchTerms: string[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const status = searchParams.get('status') ?? '';
  const searchTerm = searchParams.get('search_term') ?? '';
  const hasFilters = status || searchTerm;

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="flex items-center gap-3 mb-5 flex-wrap">
      <SlidersHorizontal className="w-4 h-4 text-muted shrink-0" />
      <select
        value={status}
        onChange={(e) => updateParam('status', e.target.value)}
        className={SELECT_CLASS}
        style={{ backgroundColor: 'var(--color-inset)' }}
      >
        <option value="">Todos os status</option>
        {STATUS_ORDER.map((s) => (
          <option key={s} value={s}>
            {statusConfig[s].label}
          </option>
        ))}
      </select>
      <select
        value={searchTerm}
        onChange={(e) => updateParam('search_term', e.target.value)}
        className={SELECT_CLASS}
        style={{ backgroundColor: 'var(--color-inset)' }}
      >
        <option value="">Todos os termos de busca</option>
        {searchTerms.map((term) => (
          <option key={term} value={term}>
            {term}
          </option>
        ))}
      </select>
      {hasFilters && (
        <button
          onClick={() => router.push(pathname)}
          className="text-[11px] text-muted hover:text-secondary transition-colors font-black uppercase tracking-widest"
        >
          Limpar filtros
        </button>
      )}
    </div>
  );
}
