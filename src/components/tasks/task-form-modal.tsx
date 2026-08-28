import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { taskSchema, type TaskForm } from '@/schemas/task';
import { EMPLOYEES } from '@/services/employees';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { addTask, updateTask } from '@/store/slices/task-slice';
import { addNotification } from '@/store/slices/notification-slice';
import { selectAllCustomers } from '@/store/slices/customer-slice';
import type { Task } from '@/types';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalDescription,
  ModalFooter,
  ModalClose,
  Button,
  Input,
  Label,
} from '@/lib/components';

interface TaskFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task?: Task | null;
}

export function TaskFormModal({
  open,
  onOpenChange,
  task,
}: TaskFormModalProps) {
  const dispatch = useAppDispatch();
  const customers = useAppSelector(selectAllCustomers);
  const isEditing = !!task;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TaskForm>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: '',
      description: '',
      assignedEmployeeId: '',
      priority: 'Medium',
      dueDate: '',
      status: 'Todo',
      relatedCustomerId: '',
    },
  });

  useEffect(() => {
    if (open) {
      if (task) {
        reset({
          title: task.title,
          description: task.description,
          assignedEmployeeId: task.assignedEmployeeId,
          priority: task.priority,
          dueDate: task.dueDate,
          status: task.status,
          relatedCustomerId: task.relatedCustomerId ?? '',
        });
      } else {
        reset({
          title: '',
          description: '',
          assignedEmployeeId: '',
          priority: 'Medium',
          dueDate: '',
          status: 'Todo',
          relatedCustomerId: '',
        });
      }
    }
  }, [open, task, reset]);

  const onSubmit = (data: TaskForm) => {
    const payload = {
      ...data,
      description: data.description ?? '',
      relatedCustomerId: data.relatedCustomerId || undefined,
    };

    if (isEditing && task) {
      dispatch(updateTask({ id: task.id, changes: payload }));
      dispatch(
        addNotification(
          'Task updated',
          `${data.title} has been updated.`,
          'success'
        )
      );
    } else {
      dispatch(
        addTask({
          id: `task-${Date.now()}`,
          ...payload,
          createdAt: new Date().toISOString(),
        })
      );
      dispatch(
        addNotification(
          'Task created',
          `${data.title} has been created.`,
          'success'
        )
      );
    }
    onOpenChange(false);
  };

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent className="sm:max-w-lg">
        <ModalHeader>
          <ModalTitle>{isEditing ? 'Edit Task' : 'Create Task'}</ModalTitle>
          <ModalDescription>
            {isEditing
              ? 'Update the task details below.'
              : 'Fill in the details to create a new task.'}
          </ModalDescription>
        </ModalHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" error={!!errors.title} {...register('title')} />
            {errors.title && (
              <p className="text-xs text-destructive">{errors.title.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <textarea
              id="description"
              rows={3}
              className="flex w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              {...register('description')}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <select
                id="priority"
                className="flex h-9 w-full rounded-lg border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                {...register('priority')}
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                className="flex h-9 w-full rounded-lg border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                {...register('status')}
              >
                <option value="Todo">Todo</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="dueDate">Due Date</Label>
              <Input
                id="dueDate"
                type="date"
                error={!!errors.dueDate}
                {...register('dueDate')}
              />
              {errors.dueDate && (
                <p className="text-xs text-destructive">
                  {errors.dueDate.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="assignedEmployeeId">Assign To</Label>
              <select
                id="assignedEmployeeId"
                className="flex h-9 w-full rounded-lg border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                {...register('assignedEmployeeId')}
              >
                <option value="">Select employee</option>
                {EMPLOYEES.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.name}
                  </option>
                ))}
              </select>
              {errors.assignedEmployeeId && (
                <p className="text-xs text-destructive">
                  {errors.assignedEmployeeId.message}
                </p>
              )}
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="relatedCustomerId">
                Related Customer (optional)
              </Label>
              <select
                id="relatedCustomerId"
                className="flex h-9 w-full rounded-lg border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                {...register('relatedCustomerId')}
              >
                <option value="">None</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <ModalFooter>
            <ModalClose asChild>
              <Button variant="outline">Cancel</Button>
            </ModalClose>
            <Button type="submit">
              {isEditing ? 'Save Changes' : 'Create Task'}
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}
