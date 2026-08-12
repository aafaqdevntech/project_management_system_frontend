import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { assignTaskSchema, type AssignTaskFormValues } from '@/schemas/task.schema';
import { assignTask } from '@/services/taskService';
import { getApiErrorMessage } from '@/lib/apiError';
import type { Teammate } from '@/types/teammates';
import { Modal } from '@/components/ui/Modal';
import { Label } from '@/components/ui/Label';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';

interface AssignTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  taskId: number;
  teammates: Teammate[];
}

/** Project team-lead-only "assign this task to a teammate" form — POST /tasks/{id}/assign. */
export function AssignTaskModal({ isOpen, onClose, onSuccess, taskId, teammates }: AssignTaskModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AssignTaskFormValues>({
    resolver: zodResolver(assignTaskSchema),
  });

  const handleClose = () => {
    reset();
    setFormError(null);
    onClose();
  };

  const onSubmit = async (values: AssignTaskFormValues) => {
    setFormError(null);
    setIsSubmitting(true);
    try {
      await assignTask(taskId, Number(values.assigned_to_id));
      onSuccess();
      handleClose();
    } catch (err) {
      setFormError(getApiErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Assign task">
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
          <Label htmlFor="assigned_to_id">Assign to</Label>
          <Select
            id="assigned_to_id"
            defaultValue=""
            error={errors.assigned_to_id?.message}
            {...register('assigned_to_id')}
          >
            <option value="" disabled>
              Select a teammate
            </option>
            {teammates.map((teammate) => (
              <option key={teammate.id} value={teammate.id}>
                {teammate.full_name}
              </option>
            ))}
          </Select>
          {errors.assigned_to_id ? (
            <p className="mt-1.5 text-sm text-danger-600">{errors.assigned_to_id.message}</p>
          ) : null}
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isSubmitting} disabled={isSubmitting}>
            Assign
          </Button>
        </div>
      </form>
    </Modal>
  );
}
