'use client';

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { statusConfig, type LeadProspeccaoStatus } from './types';

export function StatusChart({ counts }: { counts: Record<LeadProspeccaoStatus, number> }) {
  const data = (Object.keys(statusConfig) as LeadProspeccaoStatus[])
    .map((status) => ({
      status,
      label: statusConfig[status].label,
      value: counts[status] ?? 0,
      color: statusConfig[status].chartColor,
    }))
    .filter((d) => d.value > 0);

  if (data.length === 0) {
    return <p className="text-sm text-muted text-center py-16">Sem dados para exibir.</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="label"
          innerRadius={60}
          outerRadius={95}
          paddingAngle={2}
          stroke="none"
        >
          {data.map((entry) => (
            <Cell key={entry.status} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 12,
            fontSize: 12,
          }}
        />
        <Legend
          verticalAlign="bottom"
          height={36}
          formatter={(value) => <span style={{ fontSize: 11, color: 'var(--color-muted)' }}>{value}</span>}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
