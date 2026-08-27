import { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { useAppSelector } from '@/store/hooks';
import { selectAllTasks } from '@/store/slices/task-slice';
import type { TaskStatus } from '@/types';

const STATUS_COLORS: Record<TaskStatus, string> = {
  Todo: 'hsl(199 89% 48%)',
  'In Progress': 'hsl(38 92% 45%)',
  Completed: 'hsl(142 71% 35%)',
};

export function TaskStatusChart() {
  const tasks = useAppSelector(selectAllTasks);

  const data = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const t of tasks) {
      counts[t.status] = (counts[t.status] || 0) + 1;
    }
    const order: TaskStatus[] = ['Todo', 'In Progress', 'Completed'];
    return order
      .filter((s) => counts[s] !== undefined)
      .map((status) => ({ name: status, value: counts[status] || 0 }));
  }, [tasks]);

  if (data.length === 0) {
    return (
      <div className="flex h-[250px] items-center justify-center text-sm text-muted-foreground">
        No tasks data
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
        <Bar dataKey="value" radius={[6, 6, 0, 0]}>
          {data.map((entry) => (
            <Cell
              key={entry.name}
              fill={STATUS_COLORS[entry.name as TaskStatus]}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
