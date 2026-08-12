import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { assignTeamSchema, type AssignTeamFormValues } from '@/schemas/project.schema';
import { assignTeamToProject } from '@/services/projectService';
import { getApiErrorMessage } from '@/lib/apiError';
import { Modal } from '@/components/ui/Modal';
import { Label } from '@/components/ui/Label';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

interface AssignTeamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  projectId: number;
}

/** Admin-only "assign a team to this project" form — POST /projects/{id}/assign_team. */
export function AssignTeamModal({ isOpen, onClose, onSuccess, projectId }: AssignTeamModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AssignTeamFormValues>({
    resolver: zodResolver(assignTeamSchema),
  });

  const handleClose = () => {
    reset();
    setFormError(null);
    onClose();
  };

  const onSubmit = async (values: AssignTeamFormValues) => {
    setFormError(null);
    setIsSubmitting(true);
    try {
      await assignTeamToProject(projectId, values.team_name);
      onSuccess();
      handleClose();
    } catch (err) {
      setFormError(getApiErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Assign team">
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
          <Label htmlFor="team_name">Team name</Label>
          <Input
            id="team_name"
            type="text"
            autoComplete="off"
            error={errors.team_name?.message}
            {...register('team_name')}
          />
          {errors.team_name ? (
            <p className="mt-1.5 text-sm text-danger-600">{errors.team_name.message}</p>
          ) : null}
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isSubmitting} disabled={isSubmitting}>
            Assign team
          </Button>
        </div>
      </form>
    </Modal>
  );
}
