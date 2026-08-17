import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { changeJobPositionSchema, type ChangeJobPositionFormValues } from '@/schemas/employment.schema';
import { updateEmploymentDetail } from '@/services/peopleService';
import { getApiErrorMessage } from '@/lib/apiError';
import { Button, Input, Label, Modal } from '@/components/ui/index';

interface ChangeJobPositionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  userId: number;
  currentJobPosition: string;
}

/** Admin-only "change job position" form — PATCH /users/{id}/employment_detail with just { job_position }. */
export function ChangeJobPositionModal({
  isOpen,
  onClose,
  onSuccess,
  userId,
  currentJobPosition,
}: ChangeJobPositionModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ChangeJobPositionFormValues>({
    resolver: zodResolver(changeJobPositionSchema),
  });

  useEffect(() => {
    if (isOpen) {
      reset({ job_position: currentJobPosition });
    }
  }, [isOpen, currentJobPosition, reset]);

  const handleClose = () => {
    setFormError(null);
    onClose();
  };

  const onSubmit = async (values: ChangeJobPositionFormValues) => {
    setFormError(null);
    setIsSubmitting(true);
    try {
      await updateEmploymentDetail(userId, values);
      onSuccess();
      handleClose();
    } catch (err) {
      setFormError(getApiErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Change job position">
      {formError ? (
        <div
          role="alert"
          className="mb-4 rounded-md bg-danger-50 px-3 py-2 text-sm text-danger-700"
        >
          {formError}
        </div>
      ) : null}

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        <div>
          <Label htmlFor="job_position">Job position</Label>
          <Input
            id="job_position"
            type="text"
            autoComplete="off"
            error={errors.job_position?.message}
            {...register('job_position')}
          />
          {errors.job_position ? (
            <p className="mt-1.5 text-sm text-danger-600">{errors.job_position.message}</p>
          ) : null}
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isSubmitting} disabled={isSubmitting}>
            Save job position
          </Button>
        </div>
      </form>
    </Modal>
  );
}
