import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { leadSchema, LEAD_STATUS_OPTIONS, type LeadForm } from '@/schemas/lead';
import { convertLeadSchema } from '@/components/leads/convert-lead-dialog';
import { EMPLOYEES } from '@/services/employees';
import { useAppDispatch } from '@/store/hooks';
import { addLead, updateLead } from '@/store/slices/lead-slice';
import { addCustomer } from '@/store/slices/customer-slice';
import { addNotification } from '@/store/slices/notification-slice';
import { usePersistSubmit } from '@/hooks/use-persist-submit';
import type { Lead } from '@/types';
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
  Spinner,
} from '@/components/ui';

interface LeadFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lead?: Lead | null;
}

export function LeadFormModal({
  open,
  onOpenChange,
  lead,
}: LeadFormModalProps) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const isEditing = !!lead;
  const { saving, run } = usePersistSubmit();

  const [location, setLocation] = useState('');
  const [locationError, setLocationError] = useState<string | null>(null);

  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<LeadForm>({
    resolver: zodResolver(leadSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      company: '',
      status: 'New',
      assignedEmployeeId: '',
    },
  });

  useEffect(() => {
    if (open) {
      setLocation('');
      setLocationError(null);
      if (lead) {
        reset({
          name: lead.name,
          email: lead.email,
          phone: lead.phone,
          company: lead.company,
          status: lead.status,
          assignedEmployeeId: lead.assignedEmployeeId,
        });
      } else {
        reset({
          name: '',
          email: '',
          phone: '',
          company: '',
          status: 'New',
          assignedEmployeeId: '',
        });
      }
    }
  }, [open, lead, reset]);

  const watchedStatus = watch('status');
  const needsLocation =
    watchedStatus === 'Converted' &&
    (!isEditing || lead?.status !== 'Converted');

  const onSubmit = (data: LeadForm) => {
    const isNewConversion =
      data.status === 'Converted' &&
      (!isEditing || lead?.status !== 'Converted');

    if (isNewConversion) {
      const parsed = convertLeadSchema.safeParse({ location });
      if (!parsed.success) {
        setLocationError('Location is required (min 3 characters)');
        return;
      }
    }

    void run(() => {
      if (isEditing && lead) {
        dispatch(updateLead({ id: lead.id, changes: data }));
        dispatch(
          addNotification(
            'Lead updated',
            `${data.name} has been updated.`,
            'success'
          )
        );
      } else {
        dispatch(
          addLead({
            id: `lead-${Date.now()}`,
            ...data,
            createdAt: new Date().toISOString(),
          })
        );
        dispatch(
          addNotification(
            'Lead added',
            `${data.name} has been created.`,
            'success'
          )
        );
      }

      if (isNewConversion) {
        dispatch(
          addCustomer({
            id: `cust-${Date.now()}`,
            name: data.name,
            email: data.email,
            phone: data.phone,
            company: data.company,
            location: location.trim(),
            status: 'Active',
            assignedEmployeeId: data.assignedEmployeeId,
            createdAt: new Date().toISOString(),
            notes: [],
          })
        );
        dispatch(
          addNotification(
            'Lead converted',
            `${data.name} has been added as a customer.`,
            'success'
          )
        );
      }
    }).then(() => {
      if (isNewConversion) {
        navigate('/customers');
      }
      onOpenChange(false);
    });
  };

  return (
    <Modal
      open={open}
      onOpenChange={(o) => {
        if (saving && !o) return;
        onOpenChange(o);
      }}
    >
      <ModalContent className="sm:max-w-lg">
        <ModalHeader>
          <ModalTitle>{isEditing ? 'Edit Lead' : 'Add Lead'}</ModalTitle>
          <ModalDescription>
            {isEditing
              ? 'Update the lead details below.'
              : 'Fill in the details to add a new lead.'}
          </ModalDescription>
        </ModalHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                disabled={saving}
                error={!!errors.name}
                {...register('name')}
              />
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
                disabled={saving}
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
              <Input
                id="phone"
                disabled={saving}
                error={!!errors.phone}
                {...register('phone')}
              />
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
                disabled={saving}
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
              <Label htmlFor="status">Status</Label>
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger
                      id="status"
                      disabled={saving}
                      className="w-full"
                    >
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent align="start">
                      {LEAD_STATUS_OPTIONS.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            {needsLocation && (
              <div className="space-y-2">
                <Label htmlFor="lead-location">Location</Label>
                <Input
                  id="lead-location"
                  disabled={saving}
                  error={!!locationError}
                  placeholder="e.g. New York, NY"
                  value={location}
                  onChange={(e) => {
                    setLocation(e.target.value);
                    if (locationError) setLocationError(null);
                  }}
                />
                {locationError && (
                  <p className="text-xs text-destructive">{locationError}</p>
                )}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="assignedEmployeeId">Assigned Employee</Label>
              <Controller
                name="assignedEmployeeId"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger
                      id="assignedEmployeeId"
                      disabled={saving}
                      className="w-full"
                    >
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
              <Button variant="outline" disabled={saving}>
                Cancel
              </Button>
            </ModalClose>
            <Button type="submit" disabled={saving}>
              {saving && <Spinner size="sm" />}
              {isEditing ? 'Save Changes' : 'Add Lead'}
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}
