import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { customerSchema, type CustomerForm } from '@/schemas/customer';
import { EMPLOYEES } from '@/services/employees';
import { useAppDispatch } from '@/store/hooks';
import { addCustomer, updateCustomer } from '@/store/slices/customer-slice';
import { addNotification } from '@/store/slices/notification-slice';
import type { Customer } from '@/types';
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

interface CustomerFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customer?: Customer | null;
}

export function CustomerFormModal({
  open,
  onOpenChange,
  customer,
}: CustomerFormModalProps) {
  const dispatch = useAppDispatch();
  const isEditing = !!customer;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CustomerForm>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      company: '',
      location: '',
      status: 'Active',
      assignedEmployeeId: '',
    },
  });

  useEffect(() => {
    if (open) {
      if (customer) {
        reset({
          name: customer.name,
          email: customer.email,
          phone: customer.phone,
          company: customer.company,
          location: customer.location,
          status: customer.status,
          assignedEmployeeId: customer.assignedEmployeeId,
        });
      } else {
        reset({
          name: '',
          email: '',
          phone: '',
          company: '',
          location: '',
          status: 'Active',
          assignedEmployeeId: '',
        });
      }
    }
  }, [open, customer, reset]);

  const onSubmit = (data: CustomerForm) => {
    if (isEditing && customer) {
      dispatch(updateCustomer({ id: customer.id, changes: data }));
      dispatch(
        addNotification(
          'Customer updated',
          `${data.name} has been updated.`,
          'success'
        )
      );
    } else {
      dispatch(
        addCustomer({
          id: `cust-${Date.now()}`,
          ...data,
          createdAt: new Date().toISOString(),
          notes: [],
        })
      );
      dispatch(
        addNotification(
          'Customer added',
          `${data.name} has been created.`,
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
          <ModalTitle>
            {isEditing ? 'Edit Customer' : 'Add Customer'}
          </ModalTitle>
          <ModalDescription>
            {isEditing
              ? 'Update the customer details below.'
              : 'Fill in the details to add a new customer.'}
          </ModalDescription>
        </ModalHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" error={!!errors.name} {...register('name')} />
              {errors.name && (
                <p className="text-xs text-destructive">
                  {errors.name.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                error={!!errors.email}
                {...register('email')}
              />
              {errors.email && (
                <p className="text-xs text-destructive">
                  {errors.email.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" error={!!errors.phone} {...register('phone')} />
              {errors.phone && (
                <p className="text-xs text-destructive">
                  {errors.phone.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="company">Company</Label>
              <Input
                id="company"
                error={!!errors.company}
                {...register('company')}
              />
              {errors.company && (
                <p className="text-xs text-destructive">
                  {errors.company.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                error={!!errors.location}
                {...register('location')}
              />
              {errors.location && (
                <p className="text-xs text-destructive">
                  {errors.location.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                className="flex h-9 w-full rounded-lg border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                {...register('status')}
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="assignedEmployeeId">Assigned Employee</Label>
              <select
                id="assignedEmployeeId"
                className="flex h-9 w-full rounded-lg border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                {...register('assignedEmployeeId')}
              >
                <option value="">Select employee</option>
                {EMPLOYEES.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.name} — {e.role}
                  </option>
                ))}
              </select>
              {errors.assignedEmployeeId && (
                <p className="text-xs text-destructive">
                  {errors.assignedEmployeeId.message}
                </p>
              )}
            </div>
          </div>

          <ModalFooter>
            <ModalClose asChild>
              <Button variant="outline">Cancel</Button>
            </ModalClose>
            <Button type="submit">
              {isEditing ? 'Save Changes' : 'Add Customer'}
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}
