import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createTaskSchema, type CreateTaskFormValues } from '@/schemas/task.schema';
import { createProjectTask } from '@/services/projectService';
import { getApiErrorMessage } from '@/lib/apiError';
import type { Issue } from '@/types/issues';
import { Modal } from '@/components/ui/Modal';
import { Label } from '@/components/ui/Label';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  projectId: number;
  issues: Issue[];
}

/** Project team-lead-only "create a task" form — POST /projects/{id}/tasks. */
export function AddTaskModal({ isOpen, onClose, onSuccess, projectId, issues }: AddTaskModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateTaskFormValues>({
    resolver: zodResolver(createTaskSchema),
  });

  const handleClose = () => {
    reset();
    setFormError(null);
    onClose();
  };

  const onSubmit = async (values: CreateTaskFormValues) => {
    setFormError(null);
    setIsSubmitting(true);
    try {
      await createProjectTask(projectId, {
        title: values.title,
        description: values.description,
        priority: values.priority || undefined,
        due_date: values.due_date || undefined,
        issue_id: values.issue_id ? Number(values.issue_id) : null,
      });
      onSuccess();
      handleClose();
    } catch (err) {
      setFormError(getApiErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Add task">
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
          <Label htmlFor="priority">Priority</Label>
          <Select id="priority" defaultValue="" {...register('priority')}>
            <option value="">Default</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="normal">Normal</option>
          </Select>
        </div>

        <div>
          <Label htmlFor="due_date">Due date</Label>
          <Input id="due_date" type="date" {...register('due_date')} />
        </div>

        <div>
          <Label htmlFor="issue_id">Related issue</Label>
          <Select id="issue_id" defaultValue="" {...register('issue_id')}>
            <option value="">None</option>
            {issues.map((issue) => (
              <option key={issue.id} value={issue.id}>
                {issue.title}
              </option>
            ))}
          </Select>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isSubmitting} disabled={isSubmitting}>
            Create task
          </Button>
        </div>
      </form>
    </Modal>
  );
}
