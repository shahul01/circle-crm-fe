import { useState, useMemo } from 'react';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { selectAllTasks, setTaskStatus } from '@/store/slices/task-slice';
import { addNotification } from '@/store/slices/notification-slice';
import { EMPLOYEES } from '@/services/employees';
import { TaskFormModal } from '@/components/tasks/task-form-modal';
import {
  Badge,
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '@/lib/components';
import { Plus, List } from 'lucide-react';
import type { Task, TaskStatus, TaskPriority } from '@/types';

const COLUMNS: { status: TaskStatus; color: string; bg: string }[] = [
  { status: 'Todo', color: 'bg-primary', bg: 'bg-primary/5' },
  { status: 'In Progress', color: 'bg-warning', bg: 'bg-warning/5' },
  { status: 'Completed', color: 'bg-success', bg: 'bg-success/5' },
];

const employeeMap = new Map(EMPLOYEES.map((e) => [e.id, e.name]));

const PRIORITY_BADGE: Record<
  TaskPriority,
  'destructive' | 'warning' | 'secondary'
> = {
  High: 'destructive',
  Medium: 'warning',
  Low: 'secondary',
};

function SortableTaskCard({ task }: { task: Task }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id, data: { status: task.status } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="cursor-grab rounded-lg border border-border bg-card p-3 shadow-sm transition-shadow hover:shadow-md active:cursor-grabbing"
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-medium text-foreground">{task.title}</p>
        <Badge
          variant={PRIORITY_BADGE[task.priority]}
          className="shrink-0 text-[10px]"
        >
          {task.priority}
        </Badge>
      </div>
      {task.description && (
        <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
          {task.description}
        </p>
      )}
      <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
        <span>{employeeMap.get(task.assignedEmployeeId) ?? 'Unassigned'}</span>
        {task.dueDate && (
          <span>{new Date(task.dueDate).toLocaleDateString()}</span>
        )}
      </div>
    </div>
  );
}

function TaskKanbanPage({ onToggleView }: { onToggleView: () => void }) {
  const dispatch = useAppDispatch();
  const tasks = useAppSelector(selectAllTasks);
  const [formOpen, setFormOpen] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const tasksByStatus = useMemo(() => {
    const map: Record<TaskStatus, Task[]> = {
      Todo: [],
      'In Progress': [],
      Completed: [],
    };
    for (const t of tasks) {
      if (map[t.status]) map[t.status].push(t);
    }
    return map;
  }, [tasks]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const taskId = active.id as string;
    const newStatus = (over.data.current?.status ?? over.id) as TaskStatus;

    if (newStatus && COLUMNS.some((c) => c.status === newStatus)) {
      const task = tasks.find((t) => t.id === taskId);
      if (task && task.status !== newStatus) {
        dispatch(setTaskStatus({ taskId, status: newStatus }));
        dispatch(
          addNotification(
            'Task moved',
            `"${task.title}" moved to ${newStatus}.`,
            'success'
          )
        );
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Tasks — Kanban</h2>
          <p className="text-sm text-muted-foreground">
            Drag tasks between columns to change status
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onToggleView}>
            <List className="mr-1.5 h-3.5 w-3.5" />
            List View
          </Button>
          <Button size="sm" onClick={() => setFormOpen(true)}>
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            Create Task
          </Button>
        </div>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {COLUMNS.map((col) => (
            <Card key={col.status} className={col.bg}>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <span className={`h-2.5 w-2.5 rounded-full ${col.color}`} />
                  {col.status}
                  <Badge variant="secondary" className="ml-auto text-xs">
                    {tasksByStatus[col.status].length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <SortableContext
                  items={tasksByStatus[col.status].map((t) => t.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="min-h-[100px] space-y-2">
                    {tasksByStatus[col.status].length === 0 ? (
                      <p className="py-8 text-center text-xs text-muted-foreground">
                        No tasks
                      </p>
                    ) : (
                      tasksByStatus[col.status].map((task) => (
                        <SortableTaskCard key={task.id} task={task} />
                      ))
                    )}
                  </div>
                </SortableContext>
              </CardContent>
            </Card>
          ))}
        </div>
      </DndContext>

      <TaskFormModal open={formOpen} onOpenChange={setFormOpen} />
    </div>
  );
}

export default TaskKanbanPage;
