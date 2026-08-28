import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
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
  Select,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectItem,
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
    control,
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
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="status" className="w-full">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent align="start">
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="assignedEmployeeId">Assigned Employee</Label>
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
                          {e.name} — {e.role}
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
