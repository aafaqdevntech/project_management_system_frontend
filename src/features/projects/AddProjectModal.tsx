import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createProjectSchema, type CreateProjectFormValues } from '@/schemas/project.schema';
import { createProject } from '@/services/projectService';
import { getApiErrorMessage } from '@/lib/apiError';
import { Modal } from '@/components/ui/Modal';
import { Label } from '@/components/ui/Label';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';

interface AddProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

/** Admin-only "create a project" form — POST /projects, then the parent list reloads. */
export function AddProjectModal({ isOpen, onClose, onSuccess }: AddProjectModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateProjectFormValues>({
    resolver: zodResolver(createProjectSchema),
  });

  const handleClose = () => {
    reset();
    setFormError(null);
    onClose();
  };

  const onSubmit = async (values: CreateProjectFormValues) => {
    setFormError(null);
    setIsSubmitting(true);
    try {
      await createProject(values);
      onSuccess();
      handleClose();
    } catch (err) {
      setFormError(getApiErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Add project">
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
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            type="text"
            autoComplete="off"
            error={errors.title?.message}
            {...register('title')}
          />
          {errors.title ? (
            <p className="mt-1.5 text-sm text-danger-600">{errors.title.message}</p>
          ) : null}
        </div>

        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea id="description" error={errors.description?.message} {...register('description')} />
          {errors.description ? (
            <p className="mt-1.5 text-sm text-danger-600">{errors.description.message}</p>
          ) : null}
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isSubmitting} disabled={isSubmitting}>
            Create project
          </Button>
        </div>
      </form>
    </Modal>
  );
}
