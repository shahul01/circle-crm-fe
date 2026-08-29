import { useMemo, useState } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { useAppSelector } from '@/store/hooks';
import { selectAllLeads } from '@/store/slices/lead-slice';
import type { LeadStatus } from '@/types';

const STATUS_COLORS: Record<LeadStatus, string> = {
  New: 'hsl(199 89% 48%)',
  Contacted: 'hsl(215 25% 27%)',
  'Follow-up': 'hsl(38 92% 45%)',
  Qualified: 'hsl(142 71% 35%)',
  Converted: 'hsl(262 83% 58%)',
  Lost: 'hsl(0 72% 51%)',
};

export function LeadPipelineChart() {
  const leads = useAppSelector(selectAllLeads);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const data = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const l of leads) {
      counts[l.status] = (counts[l.status] || 0) + 1;
    }
    return (Object.keys(counts) as LeadStatus[]).map((status) => ({
      name: status,
      value: counts[status],
    }));
  }, [leads]);

  if (data.length === 0) {
    return (
      <div className="flex h-[250px] items-center justify-center text-sm text-muted-foreground">
        No leads data
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={250}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={55}
          outerRadius={90}
          paddingAngle={3}
          dataKey="value"
          stroke="none"
          onMouseEnter={(_, index) => setActiveIndex(index)}
          onMouseLeave={() => setActiveIndex(null)}
        >
          {data.map((entry, i) => (
            <Cell
              key={entry.name}
              fill={STATUS_COLORS[entry.name as LeadStatus]}
              fillOpacity={activeIndex === i ? 0.5 : 0.15}
              stroke={STATUS_COLORS[entry.name as LeadStatus]}
              strokeWidth={2}
            />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            borderRadius: '0.75rem',
            border: '1px solid hsl(214 32% 88%)',
            background: 'hsl(0 0% 100%)',
            color: 'hsl(222 47% 11%)',
            fontSize: '0.8125rem',
          }}
        />
        <Legend
          iconType="circle"
          iconSize={8}
          formatter={(value: string) => (
            <span className="text-xs text-muted-foreground">{value}</span>
          )}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
