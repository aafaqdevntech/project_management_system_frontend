import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { changeIssueStatusSchema, type ChangeIssueStatusFormValues } from '@/schemas/issue.schema';
import { resolveIssue, rejectIssue } from '@/services/issueService';
import { getApiErrorMessage } from '@/lib/apiError';
import { Modal } from '@/components/ui/Modal';
import { Label } from '@/components/ui/Label';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';

interface ChangeIssueStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  issueId: number;
}

/** Project team-lead-only "resolve or reject this issue" form — POST /issues/{id}/resolve or /issues/{id}/reject. */
export function ChangeIssueStatusModal({
  isOpen,
  onClose,
  onSuccess,
  issueId,
}: ChangeIssueStatusModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ChangeIssueStatusFormValues>({
    resolver: zodResolver(changeIssueStatusSchema),
  });

  const handleClose = () => {
    reset();
    setFormError(null);
    onClose();
  };

  const onSubmit = async (values: ChangeIssueStatusFormValues) => {
    setFormError(null);
    setIsSubmitting(true);
    try {
      if (values.status === 'resolved') {
        await resolveIssue(issueId, values.resolution_note);
      } else {
        await rejectIssue(issueId, values.resolution_note);
      }
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
          <Select id="status" defaultValue="" error={errors.status?.message} {...register('status')}>
            <option value="" disabled>
              Select a status
            </option>
            <option value="resolved">Resolved</option>
            <option value="rejected">Rejected</option>
          </Select>
          {errors.status ? (
            <p className="mt-1.5 text-sm text-danger-600">{errors.status.message}</p>
          ) : null}
        </div>

        <div>
          <Label htmlFor="resolution_note">Resolution note</Label>
          <Textarea
            id="resolution_note"
            error={errors.resolution_note?.message}
            {...register('resolution_note')}
          />
          {errors.resolution_note ? (
            <p className="mt-1.5 text-sm text-danger-600">{errors.resolution_note.message}</p>
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
