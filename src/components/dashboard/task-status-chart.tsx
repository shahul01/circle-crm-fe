import { useMemo } from 'react';
import {
  BarChart,
  Bar,
  Rectangle,
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

function ActiveBar(props: { payload?: { name?: string }; name?: string }) {
  const color =
    STATUS_COLORS[(props.payload?.name ?? props.name) as TaskStatus];
  return (
    <Rectangle
      {...props}
      fill={color}
      fillOpacity={0.5}
      stroke={color}
      strokeWidth={2}
      radius={[6, 6, 0, 0]}
    />
  );
}

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
          cursor={false}
          contentStyle={{
            borderRadius: '0.75rem',
            border: '1px solid hsl(214 32% 88%)',
            background: 'hsl(0 0% 100%)',
            color: 'hsl(222 47% 11%)',
            fontSize: '0.8125rem',
          }}
        />
        <Bar
          dataKey="value"
          strokeWidth={2}
          radius={[6, 6, 0, 0]}
          activeBar={ActiveBar}
        >
          {data.map((entry) => (
            <Cell
              key={entry.name}
              fill={STATUS_COLORS[entry.name as TaskStatus]}
              fillOpacity={0.15}
              stroke={STATUS_COLORS[entry.name as TaskStatus]}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
