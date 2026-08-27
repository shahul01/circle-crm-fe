import { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useAppSelector } from '@/store/hooks';
import { selectAllCustomers } from '@/store/slices/customer-slice';

const MONTH_NAMES = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

export function CustomerGrowthChart() {
  const customers = useAppSelector(selectAllCustomers);

  const data = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const c of customers) {
      const d = new Date(c.createdAt);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      counts[key] = (counts[key] || 0) + 1;
    }

    const sorted = Object.entries(counts)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6);

    return sorted.map(([key, value]) => {
      const [year, month] = key.split('-');
      return {
        name: `${MONTH_NAMES[Number(month) - 1]} ${year.slice(2)}`,
        value,
      };
    });
  }, [customers]);

  if (data.length === 0) {
    return (
      <div className="flex h-[250px] items-center justify-center text-sm text-muted-foreground">
        No customer data
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={250}>
      <BarChart data={data} barSize={36}>
        <XAxis
          dataKey="name"
          tick={{ fontSize: 12, fill: 'hsl(215 20% 45%)' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          allowDecimals={false}
          tick={{ fontSize: 12, fill: 'hsl(215 20% 45%)' }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          contentStyle={{
            borderRadius: '0.75rem',
            border: '1px solid hsl(214 32% 88%)',
            background: 'hsl(0 0% 100%)',
            fontSize: '0.8125rem',
          }}
        />
        <Bar dataKey="value" fill="hsl(199 89% 48%)" radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
