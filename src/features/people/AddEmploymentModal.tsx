import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { employmentSchema, type EmploymentFormValues } from '@/schemas/employment.schema';
import { useCreateEmploymentDetailMutation } from '@/features/people/peopleApi';
import { getApiErrorMessage } from '@/lib/apiError';
import { ROLE_LABELS } from '@/lib/roles';
import type { UserRole } from '@/types/auth';
import { Modal } from '@/components/ui/Modal';
import { Label } from '@/components/ui/Label';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';

interface AddEmploymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: number;
}

const ROLE_OPTIONS = Object.entries(ROLE_LABELS) as [UserRole, string][];

/** Admin-only "create an employment record" form for a user with none yet — POST /users/{id}/employment_detail. */
export function AddEmploymentModal({ isOpen, onClose, userId }: AddEmploymentModalProps) {
  const [createEmploymentDetail, { isLoading }] = useCreateEmploymentDetailMutation();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EmploymentFormValues>({
    resolver: zodResolver(employmentSchema),
  });

  const handleClose = () => {
    reset();
    setFormError(null);
    onClose();
  };

  const onSubmit = async (values: EmploymentFormValues) => {
    setFormError(null);
    try {
      await createEmploymentDetail({
        userId,
        // The datetime-local input gives a local date/time string; the
        // backend expects ISO 8601 (confirmed live it accepts the standard
        // millisecond-bearing `toISOString()` output).
        body: { ...values, joined_at: new Date(values.joined_at).toISOString() },
      }).unwrap();
      handleClose();
    } catch (err) {
      setFormError(getApiErrorMessage(err));
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Add employment">
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

        <div>
          <Label htmlFor="role">Role</Label>
          <Select id="role" error={errors.role?.message} defaultValue="" {...register('role')}>
            <option value="" disabled>
              Select a role
            </option>
            {ROLE_OPTIONS.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
          {errors.role ? (
            <p className="mt-1.5 text-sm text-danger-600">{errors.role.message}</p>
          ) : null}
        </div>

        <div>
          <Label htmlFor="joined_at">Joined at</Label>
          <Input
            id="joined_at"
            type="datetime-local"
            error={errors.joined_at?.message}
            {...register('joined_at')}
          />
          {errors.joined_at ? (
            <p className="mt-1.5 text-sm text-danger-600">{errors.joined_at.message}</p>
          ) : null}
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isLoading} disabled={isLoading}>
            Add employment
          </Button>
        </div>
      </form>
    </Modal>
  );
}
