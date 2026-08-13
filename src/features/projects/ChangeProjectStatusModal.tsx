import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { changeStatusSchema, type ChangeStatusFormValues } from '@/schemas/project.schema';
import { updateProject } from '@/services/projectService';
import { getApiErrorMessage } from '@/lib/apiError';
import { PROJECT_STATUS_LABELS, PROJECT_STATUS_OPTIONS } from '@/lib/projectStatus';
import type { Project } from '@/types/projects';
import { Modal } from '@/components/ui/Modal';
import { Label } from '@/components/ui/Label';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';

interface ChangeProjectStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  project: Project;
}

/** Admin-only "change status" form — PATCH /projects/{id} with just { status }. */
export function ChangeProjectStatusModal({ isOpen, onClose, onSuccess, project }: ChangeProjectStatusModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ChangeStatusFormValues>({
    resolver: zodResolver(changeStatusSchema),
  });

  useEffect(() => {
    if (isOpen) {
      reset({ status: project.status });
    }
  }, [isOpen, project, reset]);

  const handleClose = () => {
    setFormError(null);
    onClose();
  };

  const onSubmit = async (values: ChangeStatusFormValues) => {
    setFormError(null);
    setIsSubmitting(true);
    try {
      await updateProject(project.id, values);
      onSuccess();
      handleClose();
    } catch (err) {
      setFormError(getApiErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Change status">
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
          <Label htmlFor="status">Status</Label>
          <Select id="status" error={errors.status?.message} {...register('status')}>
            {PROJECT_STATUS_OPTIONS.map((status) => (
              <option key={status} value={status}>
                {PROJECT_STATUS_LABELS[status]}
              </option>
            ))}
          </Select>
          {errors.status ? (
            <p className="mt-1.5 text-sm text-danger-600">{errors.status.message}</p>
          ) : null}
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isSubmitting} disabled={isSubmitting}>
            Save status
          </Button>
        </div>
      </form>
    </Modal>
  );
}
