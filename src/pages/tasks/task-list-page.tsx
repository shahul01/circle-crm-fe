import { useState } from 'react';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import {
  selectPaginatedTasks,
  selectTaskStatusFilter,
  selectTaskPriorityFilter,
  selectTaskSearch,
  selectTaskSort,
  selectTaskPage,
  selectSelectedTaskIds,
  setTaskSearch,
  setTaskStatusFilter,
  setTaskPriorityFilter,
  setTaskSort,
  setTaskPage,
  toggleTaskSelection,
  toggleSelectAllTasks,
  clearTaskSelection,
  removeManyTasks,
} from '@/store/slices/task-slice';
import { selectIsAdmin } from '@/store/slices/auth-slice';
import { addNotification } from '@/store/slices/notification-slice';
import { EMPLOYEES } from '@/services/employees';
import { TaskFormModal } from '@/components/tasks/task-form-modal';
import {
  Button,
  Card,
  CardContent,
  Badge,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Pagination,
  SearchInput,
  ConfirmDialog,
  EmptyState,
  Select,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectItem,
} from '@/components/ui';
import {
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  Pencil,
  LayoutGrid,
} from 'lucide-react';
import type { Task, TaskStatus, TaskPriority } from '@/types';

const employeeMap = new Map(EMPLOYEES.map((e) => [e.id, e.name]));

type SortField =
  | 'title'
  | 'status'
  | 'priority'
  | 'dueDate'
  | 'createdAt'
  | 'assignedEmployeeId'
  | 'board';

function SortIcon({
  field,
  sort,
}: {
  field: SortField;
  sort: { field: SortField; dir: 'asc' | 'desc' };
}) {
  if (sort.field !== field) return null;
  return sort.dir === 'asc' ? (
    <ChevronUp className="ml-1 inline h-3 w-3" />
  ) : (
    <ChevronDown className="ml-1 inline h-3 w-3" />
  );
}

const PRIORITY_BADGE: Record<
  TaskPriority,
  'destructive' | 'warning' | 'secondary'
> = {
  High: 'destructive',
  Medium: 'warning',
  Low: 'secondary',
};

const STATUS_BADGE: Record<TaskStatus, 'default' | 'warning' | 'success'> = {
  Todo: 'default',
  'In Progress': 'warning',
  Completed: 'success',
};

function TaskListPage({ onToggleView }: { onToggleView: () => void }) {
  const dispatch = useAppDispatch();
  const isAdmin = useAppSelector(selectIsAdmin);
  const { items, total, totalPages } = useAppSelector(selectPaginatedTasks);
  const statusFilter = useAppSelector(selectTaskStatusFilter);
  const priorityFilter = useAppSelector(selectTaskPriorityFilter);
  const search = useAppSelector(selectTaskSearch);
  const sort = useAppSelector(selectTaskSort);
  const page = useAppSelector(selectTaskPage);
  const selectedIds = useAppSelector(selectSelectedTaskIds);

  const [formOpen, setFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);

  const handleSort = (field: SortField) => {
    dispatch(
      setTaskSort({
        field,
        dir: sort.field === field && sort.dir === 'asc' ? 'desc' : 'asc',
      })
    );
  };

  const handleBulkDelete = () => {
    dispatch(removeManyTasks(selectedIds));
    dispatch(
      addNotification(
        'Tasks deleted',
        `${selectedIds.length} task(s) removed.`,
        'success'
      )
    );
    dispatch(clearTaskSelection());
    setBulkDeleteOpen(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Tasks</h2>
          <p className="text-sm text-muted-foreground">
            {total} task{total !== 1 ? 's' : ''} total
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={onToggleView}>
            <LayoutGrid className="mr-1.5 h-3.5 w-3.5" />
            Kanban
          </Button>
          {selectedIds.length > 0 && isAdmin && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setBulkDeleteOpen(true)}
            >
              <Trash2 className="mr-1.5 h-3.5 w-3.5" />
              Delete ({selectedIds.length})
            </Button>
          )}
          <Button
            size="sm"
            onClick={() => {
              setEditingTask(null);
              setFormOpen(true);
            }}
          >
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            Create Task
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <SearchInput
              value={search}
              onSearch={(v) => dispatch(setTaskSearch(v))}
              placeholder="Search tasks..."
              className="sm:w-72"
            />
            <Select
              value={statusFilter}
              onValueChange={(v) =>
                dispatch(setTaskStatusFilter(v as TaskStatus | 'All'))
              }
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent align="end">
                <SelectItem value="All">All Statuses</SelectItem>
                <SelectItem value="Todo">Todo</SelectItem>
                <SelectItem value="In Progress">In Progress</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={priorityFilter}
              onValueChange={(v) =>
                dispatch(setTaskPriorityFilter(v as TaskPriority | 'All'))
              }
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All Priorities" />
              </SelectTrigger>
              <SelectContent align="end">
                <SelectItem value="All">All Priorities</SelectItem>
                <SelectItem value="High">High</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="Low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {items.length === 0 ? (
            <EmptyState
              title="No tasks found"
              description={
                statusFilter !== 'All' || priorityFilter !== 'All'
                  ? 'Try adjusting your filters.'
                  : 'Get started by creating your first task.'
              }
            />
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    {isAdmin && (
                      <TableHead className="w-10">
                        <input
                          type="checkbox"
                          checked={
                            selectedIds.length === items.length &&
                            items.length > 0
                          }
                          onChange={() => dispatch(toggleSelectAllTasks())}
                          className="h-4 w-4 rounded border-input"
                        />
                      </TableHead>
                    )}
                    <TableHead>
                      <button
                        onClick={() => handleSort('title')}
                        className="hover:text-foreground"
                      >
                        Title
                        <SortIcon field="title" sort={sort} />
                      </button>
                    </TableHead>
                    <TableHead>
                      <button
                        onClick={() => handleSort('status')}
                        className="hover:text-foreground"
                      >
                        Status
                        <SortIcon field="status" sort={sort} />
                      </button>
                    </TableHead>
                    <TableHead>
                      <button
                        onClick={() => handleSort('priority')}
                        className="hover:text-foreground"
                      >
                        Priority
                        <SortIcon field="priority" sort={sort} />
                      </button>
                    </TableHead>
                    <TableHead className="hidden sm:table-cell">
                      <button
                        onClick={() => handleSort('board')}
                        className="hover:text-foreground"
                      >
                        Board
                        <SortIcon field="board" sort={sort} />
                      </button>
                    </TableHead>
                    <TableHead className="hidden md:table-cell">
                      <button
                        onClick={() => handleSort('dueDate')}
                        className="hover:text-foreground"
                      >
                        Due Date
                        <SortIcon field="dueDate" sort={sort} />
                      </button>
                    </TableHead>
                    <TableHead className="hidden lg:table-cell">
                      <button
                        onClick={() => handleSort('assignedEmployeeId')}
                        className="hover:text-foreground"
                      >
                        Assignee
                        <SortIcon field="assignedEmployeeId" sort={sort} />
                      </button>
                    </TableHead>
                    <TableHead className="hidden xl:table-cell">
                      <button
                        onClick={() => handleSort('createdAt')}
                        className="hover:text-foreground"
                      >
                        Created At
                        <SortIcon field="createdAt" sort={sort} />
                      </button>
                    </TableHead>
                    <TableHead className="w-24">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((t) => (
                    <TableRow key={t.id}>
                      {isAdmin && (
                        <TableCell>
                          <input
                            type="checkbox"
                            checked={selectedIds.includes(t.id)}
                            onChange={() => dispatch(toggleTaskSelection(t.id))}
                            className="h-4 w-4 rounded border-input"
                          />
                        </TableCell>
                      )}
                      <TableCell className="font-medium text-foreground">
                        {t.title}
                      </TableCell>
                      <TableCell>
                        <Badge variant={STATUS_BADGE[t.status]}>
                          {t.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={PRIORITY_BADGE[t.priority]}>
                          {t.priority}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell text-muted-foreground">
                        {t.position != null ? `#${t.position + 1}` : '—'}
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-muted-foreground">
                        {t.dueDate
                          ? new Date(t.dueDate).toLocaleDateString()
                          : '—'}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-muted-foreground">
                        {employeeMap.get(t.assignedEmployeeId) ?? 'Unassigned'}
                      </TableCell>
                      <TableCell className="hidden xl:table-cell text-muted-foreground">
                        {new Date(t.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => {
                              setEditingTask(t);
                              setFormOpen(true);
                            }}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          {isAdmin && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-destructive hover:text-destructive"
                              onClick={() => {
                                setEditingTask(t);
                                setDeleteConfirmOpen(true);
                              }}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {totalPages > 1 && (
        <div className="flex justify-center">
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={(p) => dispatch(setTaskPage(p))}
          />
        </div>
      )}

      <TaskFormModal
        open={formOpen}
        onOpenChange={setFormOpen}
        task={editingTask}
      />

      <ConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        title="Delete task"
        description={`Are you sure you want to delete "${editingTask?.title}"? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={() => {
          if (editingTask) {
            dispatch(removeManyTasks([editingTask.id]));
            dispatch(
              addNotification(
                'Task deleted',
                `${editingTask.title} has been removed.`,
                'success'
              )
            );
          }
          setDeleteConfirmOpen(false);
        }}
      />

      <ConfirmDialog
        open={bulkDeleteOpen}
        onOpenChange={setBulkDeleteOpen}
        title="Delete tasks"
        description={`Are you sure you want to delete ${selectedIds.length} task(s)? This action cannot be undone.`}
        confirmLabel="Delete all"
        variant="destructive"
        onConfirm={handleBulkDelete}
      />
    </div>
  );
}

export default TaskListPage;
