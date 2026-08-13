import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { editProjectSchema, type EditProjectFormValues } from '@/schemas/project.schema';
import { updateProject } from '@/services/projectService';
import { getApiErrorMessage } from '@/lib/apiError';
import type { Project } from '@/types/projects';
import { Modal } from '@/components/ui/Modal';
import { Label } from '@/components/ui/Label';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';

interface EditProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  project: Project;
}

/** Admin-only "edit title/description/end date" form — PATCH /projects/{id}. Status is changed separately (see ChangeProjectStatusModal). */
export function EditProjectModal({ isOpen, onClose, onSuccess, project }: EditProjectModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EditProjectFormValues>({
    resolver: zodResolver(editProjectSchema),
  });

  useEffect(() => {
    if (isOpen) {
      reset({
        title: project.title,
        description: project.description ?? '',
        end_date: project.end_date ?? '',
      });
    }
  }, [isOpen, project, reset]);

  const handleClose = () => {
    setFormError(null);
    onClose();
  };

  const onSubmit = async (values: EditProjectFormValues) => {
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
    <Modal isOpen={isOpen} onClose={handleClose} title="Edit project">
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

        <div>
          <Label htmlFor="end_date">End date</Label>
          <Input
            id="end_date"
            type="date"
            error={errors.end_date?.message}
            {...register('end_date')}
          />
          {errors.end_date ? (
            <p className="mt-1.5 text-sm text-danger-600">{errors.end_date.message}</p>
          ) : null}
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isSubmitting} disabled={isSubmitting}>
            Save changes
          </Button>
        </div>
      </form>
    </Modal>
  );
}
