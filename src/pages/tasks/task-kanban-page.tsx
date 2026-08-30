import { useState, useMemo } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
  type DragOverEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { cn } from '@/lib/utils';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { usePersistSubmit } from '@/hooks/use-persist-submit';
import { selectAllTasks, updateTask } from '@/store/slices/task-slice';
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
  Spinner,
} from '@/components/ui';
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

function TaskCard({ task }: { task: Task }) {
  return (
    <>
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
    </>
  );
}

function SortableTaskCard({
  task,
  disabled,
}: {
  task: Task;
  disabled?: boolean;
}) {
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
      className={cn(
        'cursor-grab rounded-lg border border-border bg-card p-3 shadow-sm transition-shadow hover:shadow-md active:cursor-grabbing',
        disabled && 'pointer-events-none cursor-wait opacity-70'
      )}
    >
      <TaskCard task={task} />
    </div>
  );
}

interface ColumnProps {
  col: (typeof COLUMNS)[number];
  tasks: Task[];
  isNotEmpty: boolean;
  isDropTarget: boolean;
  disabled?: boolean;
}

function Column({
  col,
  tasks,
  isNotEmpty,
  isDropTarget,
  disabled,
}: ColumnProps) {
  const { setNodeRef, isOver: isOverDroppable } = useDroppable({
    id: col.status,
    data: { status: col.status },
  });

  return (
    <Card
      className={cn(
        col.bg,
        isOverDroppable && 'ring-2 ring-primary/40 shadow-lg shadow-primary/10'
      )}
    >
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          <span className={`h-2.5 w-2.5 rounded-full ${col.color}`} />
          {col.status}
          <Badge variant="secondary" className="ml-auto text-xs">
            {tasks.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0 max-h-[60dvh] md:max-h-[75dvh] overflow-y-auto">
        <SortableContext
          items={tasks.map((t) => t.id)}
          strategy={verticalListSortingStrategy}
        >
          <div
            ref={setNodeRef}
            className={cn(
              'min-h-[100px] space-y-2 rounded-lg transition-colors',
              isDropTarget &&
                'border-2 border-dashed border-primary/50 bg-primary/5'
            )}
          >
            {isNotEmpty ? (
              tasks.map((task) => (
                <SortableTaskCard
                  key={task.id}
                  task={task}
                  disabled={disabled}
                />
              ))
            ) : (
              <p
                className={cn(
                  'py-8 text-center text-xs text-muted-foreground',
                  isDropTarget && 'font-medium text-primary'
                )}
              >
                {isDropTarget ? 'Drop here' : 'No tasks'}
              </p>
            )}
          </div>
        </SortableContext>
      </CardContent>
    </Card>
  );
}

function resolveDropColumn(
  overId: string | null,
  tasks: Task[]
): TaskStatus | null {
  if (!overId) return null;
  if (COLUMNS.some((c) => c.status === overId)) {
    return overId as TaskStatus;
  }
  const overTask = tasks.find((t) => t.id === overId);
  return overTask ? overTask.status : null;
}

function compareTasks(a: Task, b: Task): number {
  if (a.position != null && b.position != null) {
    return a.position - b.position;
  }
  if (a.position != null) return -1;
  if (b.position != null) return 1;
  const byCreated = a.createdAt.localeCompare(b.createdAt);
  if (byCreated !== 0) return byCreated;
  return a.id.localeCompare(b.id);
}

function TaskKanbanPage({ onToggleView }: { onToggleView: () => void }) {
  const dispatch = useAppDispatch();
  const { saving, run } = usePersistSubmit();
  const tasks = useAppSelector(selectAllTasks);
  const [formOpen, setFormOpen] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const [activeId, setActiveId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);

  const tasksByStatus = useMemo(() => {
    const map: Record<TaskStatus, Task[]> = {
      Todo: [],
      'In Progress': [],
      Completed: [],
    };
    for (const t of tasks) {
      if (map[t.status]) map[t.status].push(t);
    }
    for (const status of Object.keys(map) as TaskStatus[]) {
      map[status].sort(compareTasks);
    }
    return map;
  }, [tasks]);

  const dropColumn = resolveDropColumn(overId, tasks);
  const activeTask = activeId ? tasks.find((t) => t.id === activeId) : null;

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(String(event.active.id));
  };

  const handleDragOver = (event: DragOverEvent) => {
    setOverId(event.over ? String(event.over.id) : null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    setOverId(null);
    if (!over) return;

    const taskId = active.id as string;
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    const overIsColumn = COLUMNS.some((c) => c.status === String(over.id));
    const overTaskId = overIsColumn ? null : String(over.id);
    const targetStatus = overTaskId
      ? (tasks.find((t) => t.id === overTaskId)?.status ?? task.status)
      : (over.id as TaskStatus);

    if (!COLUMNS.some((c) => c.status === targetStatus)) return;

    const sourceIds = tasksByStatus[task.status].map((t) => t.id);
    const targetIds = tasksByStatus[targetStatus].map((t) => t.id);

    const targetWithoutActive = targetIds.filter((id) => id !== taskId);
    const insertAt =
      overTaskId && overTaskId !== taskId
        ? targetWithoutActive.indexOf(overTaskId)
        : targetWithoutActive.length;
    targetWithoutActive.splice(insertAt, 0, taskId);

    if (
      overTaskId === taskId ||
      (targetWithoutActive.length === targetIds.length &&
        targetWithoutActive.every(
          (id, i) => i < targetIds.length && id === targetIds[i]
        ))
    ) {
      return;
    }

    const updates: { id: string; changes: Partial<Task> }[] = [];

    if (targetStatus === task.status) {
      targetWithoutActive.forEach((id, idx) =>
        updates.push({ id, changes: { position: idx } })
      );
    } else {
      const sourceWithoutActive = sourceIds.filter((id) => id !== taskId);
      sourceWithoutActive.forEach((id, idx) =>
        updates.push({ id, changes: { position: idx } })
      );
      targetWithoutActive.forEach((id, idx) =>
        updates.push({
          id,
          changes: {
            position: idx,
            ...(id === taskId ? { status: targetStatus } : {}),
          },
        })
      );
    }

    run(() => {
      updates.forEach((u) => dispatch(updateTask(u)));
      if (targetStatus !== task.status) {
        dispatch(
          addNotification(
            'Task moved',
            `"${task.title}" moved to ${targetStatus}.`,
            'success'
          )
        );
      }
    });
  };

  const handleDragCancel = () => {
    setActiveId(null);
    setOverId(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Tasks — Kanban</h2>
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            Drag tasks between columns to change status
            {saving && (
              <span className="inline-flex items-center gap-1 text-xs font-medium text-primary">
                <Spinner size="sm" className="h-3 w-3" /> Moving…
              </span>
            )}
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
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {COLUMNS.map((col) => (
            <Column
              key={col.status}
              col={col}
              tasks={tasksByStatus[col.status]}
              isNotEmpty={tasksByStatus[col.status].length > 0}
              isDropTarget={dropColumn === col.status}
              disabled={saving}
            />
          ))}
        </div>

        <DragOverlay>
          {activeTask ? (
            <div className="cursor-grabbing rounded-lg border border-primary/40 bg-card p-3 shadow-2xl shadow-primary/20">
              <TaskCard task={activeTask} />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      <TaskFormModal open={formOpen} onOpenChange={setFormOpen} />
    </div>
  );
}

export default TaskKanbanPage;
