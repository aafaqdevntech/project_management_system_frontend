import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { changeRoleSchema, type ChangeRoleFormValues } from '@/schemas/employment.schema';
import { updateEmploymentDetail } from '@/services/peopleService';
import { getApiErrorMessage } from '@/lib/apiError';
import { ROLE_LABELS } from '@/lib/roles';
import type { UserRole } from '@/types/auth';
import { Button, Select, Label, Modal } from '@/components/ui/index';

interface ChangeRoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  userId: number;
  currentRole: UserRole;
}

const ROLE_OPTIONS = Object.entries(ROLE_LABELS) as [UserRole, string][];

/** Admin-only "change role" form — PATCH /users/{id}/employment_detail with just { role }. */
export function ChangeRoleModal({ isOpen, onClose, onSuccess, userId, currentRole }: ChangeRoleModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ChangeRoleFormValues>({
    resolver: zodResolver(changeRoleSchema),
  });

  useEffect(() => {
    if (isOpen) {
      reset({ role: currentRole });
    }
  }, [isOpen, currentRole, reset]);

  const handleClose = () => {
    setFormError(null);
    onClose();
  };

  const onSubmit = async (values: ChangeRoleFormValues) => {
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
    <Modal isOpen={isOpen} onClose={handleClose} title="Change role">
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
          <Label htmlFor="role">Role</Label>
          <Select id="role" error={errors.role?.message} {...register('role')}>
            {ROLE_OPTIONS.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
          {errors.role ? <p className="mt-1.5 text-sm text-danger-600">{errors.role.message}</p> : null}
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isSubmitting} disabled={isSubmitting}>
            Save role
          </Button>
        </div>
      </form>
    </Modal>
  );
}
