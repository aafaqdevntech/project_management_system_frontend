import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { assignUsernameSchema, type AssignUsernameFormValues } from '@/schemas/team.schema';
import { getApiErrorMessage } from '@/lib/apiError';
import { Modal } from '@/components/ui/Modal';
import { Label } from '@/components/ui/Label';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

interface AssignUsernameModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  submitLabel: string;
  onSubmit: (username: string) => Promise<void>;
  /** Called after a successful submit, before the modal closes — e.g. to reload the parent page's data. */
  onSuccess?: () => void;
}

/** Shared by the assign-lead / assign-member / unassign-member actions — all just need a username. */
export function AssignUsernameModal({
  isOpen,
  onClose,
  title,
  submitLabel,
  onSubmit,
  onSuccess,
}: AssignUsernameModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AssignUsernameFormValues>({
    resolver: zodResolver(assignUsernameSchema),
  });

  const handleClose = () => {
    reset();
    setFormError(null);
    onClose();
  };

  const handleFormSubmit = async (values: AssignUsernameFormValues) => {
    setFormError(null);
    setIsSubmitting(true);
    try {
      await onSubmit(values.username);
      onSuccess?.();
      handleClose();
    } catch (err) {
      setFormError(getApiErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={title}>
      {formError ? (
        <div
          role="alert"
          className="mb-4 rounded-md bg-danger-50 px-3 py-2 text-sm text-danger-700"
        >
          {formError}
        </div>
      ) : null}

      <form onSubmit={handleSubmit(handleFormSubmit)} noValidate className="space-y-4">
        <div>
          <Label htmlFor="username">Username</Label>
          <Input
            id="username"
            type="text"
            autoComplete="off"
            error={errors.username?.message}
            {...register('username')}
          />
          {errors.username ? (
            <p className="mt-1.5 text-sm text-danger-600">{errors.username.message}</p>
          ) : null}
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isSubmitting} disabled={isSubmitting}>
            {submitLabel}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
