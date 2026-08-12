import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createIssueSchema, type CreateIssueFormValues } from '@/schemas/issue.schema';
import { createProjectIssue } from '@/services/projectService';
import { getApiErrorMessage } from '@/lib/apiError';
import { Modal } from '@/components/ui/Modal';
import { Label } from '@/components/ui/Label';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';

interface AddIssueModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  projectId: number;
}

/** Project team-member-only "raise an issue" form — POST /projects/{id}/issues. */
export function AddIssueModal({ isOpen, onClose, onSuccess, projectId }: AddIssueModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateIssueFormValues>({
    resolver: zodResolver(createIssueSchema),
  });

  const handleClose = () => {
    reset();
    setFormError(null);
    onClose();
  };

  const onSubmit = async (values: CreateIssueFormValues) => {
    setFormError(null);
    setIsSubmitting(true);
    try {
      await createProjectIssue(projectId, values);
      onSuccess();
      handleClose();
    } catch (err) {
      setFormError(getApiErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Raise issue">
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
            Raise issue
          </Button>
        </div>
      </form>
    </Modal>
  );
}
