import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
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
} from '@/components/ui';

export const convertLeadSchema = z.object({
  location: z.string().trim().min(3, 'Location is required (min 3 characters)'),
});

export type ConvertLeadForm = z.infer<typeof convertLeadSchema>;

interface ConvertLeadDialogProps {
  lead: Lead | null;
  onOpenChange: (open: boolean) => void;
  onConvert: (lead: Lead, location: string) => void;
}

function ConvertLeadDialog({
  lead,
  onOpenChange,
  onConvert,
}: ConvertLeadDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ConvertLeadForm>({
    resolver: zodResolver(convertLeadSchema),
  });

  useEffect(() => {
    if (lead) {
      reset({ location: '' });
    }
  }, [lead, reset]);

  const onSubmit = ({ location }: ConvertLeadForm) => {
    if (lead) onConvert(lead, location);
  };

  return (
    <Modal open={!!lead} onOpenChange={onOpenChange}>
      <ModalContent className="max-w-sm">
        <ModalHeader>
          <ModalTitle>Convert lead to customer</ModalTitle>
          <ModalDescription>
            {lead
              ? `Convert "${lead.name}" to a customer? This will mark the lead as Converted and create a new customer record.`
              : ''}
          </ModalDescription>
        </ModalHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              placeholder="e.g. New York, NY"
              error={!!errors.location}
              {...register('location')}
            />
            {errors.location && (
              <p className="text-xs text-destructive">
                {errors.location.message}
              </p>
            )}
          </div>

          <ModalFooter>
            <ModalClose asChild>
              <Button variant="outline">Cancel</Button>
            </ModalClose>
            <Button type="submit">Convert</Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}

export { ConvertLeadDialog };
