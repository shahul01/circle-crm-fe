import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
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
  Select,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectItem,
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
    control,
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
              <Controller
                name="priority"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="priority" className="w-full">
                      <SelectValue placeholder="Priority" />
                    </SelectTrigger>
                    <SelectContent align="start">
                      <SelectItem value="Low">Low</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="High">High</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="status" className="w-full">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent align="start">
                      <SelectItem value="Todo">Todo</SelectItem>
                      <SelectItem value="In Progress">In Progress</SelectItem>
                      <SelectItem value="Completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
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
              <Controller
                name="assignedEmployeeId"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="assignedEmployeeId" className="w-full">
                      <SelectValue placeholder="Select employee" />
                    </SelectTrigger>
                    <SelectContent align="start">
                      {EMPLOYEES.map((e) => (
                        <SelectItem key={e.id} value={e.id}>
                          {e.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
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
              <Controller
                name="relatedCustomerId"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value || 'none'}
                    onValueChange={(v) => field.onChange(v === 'none' ? '' : v)}
                  >
                    <SelectTrigger id="relatedCustomerId" className="w-full">
                      <SelectValue placeholder="None" />
                    </SelectTrigger>
                    <SelectContent align="start">
                      <SelectItem value="none">None</SelectItem>
                      {customers.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
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
