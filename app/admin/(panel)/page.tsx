import { createAdminClient } from '@/lib/supabase';
import { Users, TrendingUp, Building2, CheckSquare, ArrowUpRight } from 'lucide-react';

async function getMetrics() {
  const supabase = createAdminClient();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [leadsAll, clientesResult, tarefasResult] = await Promise.allSettled([
    supabase.from('leads').select('id, created_at'),
    supabase.from('clientes').select('id', { count: 'exact', head: true }).eq('ativo', true),
    supabase.from('tarefas').select('id', { count: 'exact', head: true }).eq('status', 'pendente'),
  ]);

  const leads = leadsAll.status === 'fulfilled' ? (leadsAll.value.data ?? []) : [];
  const recentLeads = leads.filter(
    (l: { created_at: string }) => new Date(l.created_at) >= thirtyDaysAgo
  ).length;

  const clientes =
    clientesResult.status === 'fulfilled' ? (clientesResult.value.count ?? 0) : 0;
  const tarefas =
    tarefasResult.status === 'fulfilled' ? (tarefasResult.value.count ?? 0) : 0;

  return { totalLeads: leads.length, recentLeads, clientes, tarefas };
}

const accentStyles: Record<string, string> = {
  cyan: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  blue: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  purple: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  amber: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
};

export default async function AdminDashboardPage() {
  const metrics = await getMetrics();

  const cards = [
    {
      label: 'Total de Leads',
      value: metrics.totalLeads,
      sub: `+${metrics.recentLeads} nos últimos 30 dias`,
      icon: Users,
      accent: 'cyan',
    },
    {
      label: 'Leads este Mês',
      value: metrics.recentLeads,
      sub: 'últimos 30 dias',
      icon: TrendingUp,
      accent: 'blue',
    },
    {
      label: 'Clientes Ativos',
      value: metrics.clientes,
      sub: 'em projetos',
      icon: Building2,
      accent: 'purple',
    },
    {
      label: 'Tarefas Pendentes',
      value: metrics.tarefas,
      sub: 'aguardando ação',
      icon: CheckSquare,
      accent: 'amber',
    },
  ];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="font-outfit text-3xl font-black tracking-tight text-white">
          Dashboard
        </h1>
        <p className="text-gray-600 text-sm mt-1">Visão geral do negócio</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {cards.map((card) => (
          <div
            key={card.label}
            className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-all group"
          >
            <div className="flex items-start justify-between mb-5">
              <div
                className={`w-10 h-10 rounded-xl border flex items-center justify-center ${accentStyles[card.accent]}`}
              >
                <card.icon className="w-5 h-5" />
              </div>
              <ArrowUpRight className="w-4 h-4 text-gray-800 group-hover:text-gray-500 transition-colors" />
            </div>
            <p className="font-outfit text-4xl font-black text-white tracking-tight">
              {card.value}
            </p>
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mt-1">
              {card.label}
            </p>
            <p className="text-xs text-gray-700 mt-1">{card.sub}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
