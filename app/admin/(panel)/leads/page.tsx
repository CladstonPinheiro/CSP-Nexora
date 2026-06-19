import { createAdminClient } from '@/lib/supabase';
import { Plus, InboxIcon } from 'lucide-react';

async function getLeads() {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from('leads')
    .select('*')
    .order('created_at', { ascending: false });
  return data ?? [];
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
  });
}

const stageColors: Record<string, string> = {
  novo: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  contato: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  proposta: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  negociacao: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  fechado: 'bg-green-500/10 text-green-400 border-green-500/20',
  perdido: 'bg-red-500/10 text-red-400 border-red-500/20',
};

type Lead = {
  id?: string;
  empresa?: string;
  nome?: string;
  email?: string;
  nicho?: string;
  origem?: string;
  estagio?: string;
  created_at?: string;
};

export default async function LeadsPage() {
  const leads: Lead[] = await getLeads();

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="font-outfit text-3xl font-black tracking-tight text-white">
            Leads
          </h1>
          <p className="text-gray-600 text-sm mt-1">
            {leads.length} lead{leads.length !== 1 ? 's' : ''} cadastrado
            {leads.length !== 1 ? 's' : ''}
          </p>
        </div>

        <button className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl blur opacity-40 group-hover:opacity-70 transition duration-300" />
          <div className="relative flex items-center gap-2 bg-white text-black px-5 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all">
            <Plus className="w-4 h-4" />
            Novo Lead
          </div>
        </button>
      </div>

      {/* Table */}
      <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl overflow-hidden">
        {/* Column headers */}
        <div className="grid grid-cols-6 gap-4 px-6 py-3 border-b border-white/5 bg-white/[0.02]">
          {['Empresa', 'Contato', 'Nicho', 'Origem', 'Estágio', 'Data'].map((h) => (
            <span
              key={h}
              className="text-[9px] font-black uppercase tracking-widest text-gray-600"
            >
              {h}
            </span>
          ))}
        </div>

        {leads.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-4">
              <InboxIcon className="w-6 h-6 text-gray-700" />
            </div>
            <p className="text-sm font-bold text-gray-500">Nenhum lead cadastrado</p>
            <p className="text-xs text-gray-700 mt-1">
              Os leads do formulário do site aparecem aqui
            </p>
          </div>
        ) : (
          leads.map((lead, i) => {
            const stageKey = (lead.estagio ?? 'novo').toLowerCase();
            const stageStyle = stageColors[stageKey] ?? stageColors.novo;

            return (
              <div
                key={lead.id ?? i}
                className="grid grid-cols-6 gap-4 px-6 py-4 border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors items-center"
              >
                <span className="text-sm font-bold text-white truncate">
                  {lead.empresa || '—'}
                </span>

                <div className="min-w-0">
                  <p className="text-sm text-white truncate">{lead.nome || '—'}</p>
                  <p className="text-xs text-gray-600 truncate">{lead.email || ''}</p>
                </div>

                <span className="text-sm text-gray-400 truncate">
                  {lead.nicho || '—'}
                </span>

                <span className="text-sm text-gray-400 truncate">
                  {lead.origem || '—'}
                </span>

                <span
                  className={`inline-flex items-center px-2.5 py-1 rounded-lg border text-[9px] font-black uppercase tracking-widest w-fit ${stageStyle}`}
                >
                  {lead.estagio || 'Novo'}
                </span>

                <span className="text-xs text-gray-600">
                  {lead.created_at ? formatDate(lead.created_at) : '—'}
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
