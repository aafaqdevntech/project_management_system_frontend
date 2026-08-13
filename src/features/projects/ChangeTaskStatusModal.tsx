import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { changeTaskStatusSchema, type ChangeTaskStatusFormValues } from '@/schemas/task.schema';
import { Modal, Button, Label, Select } from '@/components/ui/index';
import { changeTaskStatus } from '@/services/taskService';
import { getApiErrorMessage } from '@/lib/apiError';

interface ChangeTaskStatusModalProps {
  onOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  taskId: number;
  isTeamLead: boolean;
}

export function ChangeTaskStatusModal({
  onOpen,
  onClose,
  onSuccess,
  taskId,
  isTeamLead,
}: ChangeTaskStatusModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ChangeTaskStatusFormValues>({
    resolver: zodResolver(changeTaskStatusSchema),
  });

  const handleClose = () => {
    reset();
    setFormError(null);
    onClose();
  };

  const onSubmit = async (values: ChangeTaskStatusFormValues) => {
    setFormError(null);
    setIsSubmitting(true);
    try {
      await changeTaskStatus(taskId, values.status);
      onSuccess();
      handleClose();
    } catch (err) {
      setFormError(getApiErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={onOpen} onClose={handleClose} title="Change Task Status">
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
          <Label htmlFor="status">Change Task Status</Label>
          <Select id="status" defaultValue="" error={errors.status?.message} {...register('status')}>
            <option value="" disabled>
              Select a status
            </option>
            {isTeamLead ? (
              <>
                <option value="on_hold">On Hold</option>
                <option value="returned">Returned</option>
                <option value="completed">Completed</option>
              </>
            ) : (
              <>
                <option value="working">Working</option>
                <option value="ready_for_review">Ready for Review</option>
              </>
            )}
          </Select>
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
