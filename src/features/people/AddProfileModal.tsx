import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { profileSchema, type ProfileFormValues } from '@/schemas/profile.schema';
import { createProfile } from '@/services/peopleService';
import { getApiErrorMessage } from '@/lib/apiError';
import { Modal } from '@/components/ui/Modal';
import { Label } from '@/components/ui/Label';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

interface AddProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  userId: number;
}

/** Admin-only "create a profile" form for a user with none yet — POST /users/{id}/profile. */
export function AddProfileModal({ isOpen, onClose, onSuccess, userId }: AddProfileModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
  });

  const handleClose = () => {
    reset();
    setFormError(null);
    onClose();
  };

  const onSubmit = async (values: ProfileFormValues) => {
    setFormError(null);
    // Omit blank optional fields instead of sending empty strings — the
    // backend stores omitted fields as null (confirmed live).
    const body = Object.fromEntries(
      Object.entries(values).filter(([, value]) => value !== ''),
    ) as ProfileFormValues;
    setIsSubmitting(true);
    try {
      await createProfile(userId, body);
      onSuccess();
      handleClose();
    } catch (err) {
      setFormError(getApiErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Add profile">
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
          <Label htmlFor="full_name">Full name</Label>
          <Input
            id="full_name"
            type="text"
            autoComplete="off"
            error={errors.full_name?.message}
            {...register('full_name')}
          />
          {errors.full_name ? (
            <p className="mt-1.5 text-sm text-danger-600">{errors.full_name.message}</p>
          ) : null}
        </div>

        <div>
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            type="text"
            autoComplete="off"
            error={errors.phone?.message}
            {...register('phone')}
          />
        </div>

        <div>
          <Label htmlFor="address">Address</Label>
          <Input
            id="address"
            type="text"
            autoComplete="off"
            error={errors.address?.message}
            {...register('address')}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="city">City</Label>
            <Input
              id="city"
              type="text"
              autoComplete="off"
              error={errors.city?.message}
              {...register('city')}
            />
          </div>
          <div>
            <Label htmlFor="country">Country</Label>
            <Input
              id="country"
              type="text"
              autoComplete="off"
              error={errors.country?.message}
              {...register('country')}
            />
          </div>
        </div>

        <div>
          <Label htmlFor="image_url">Image URL</Label>
          <Input
            id="image_url"
            type="url"
            autoComplete="off"
            error={errors.image_url?.message}
            {...register('image_url')}
          />
          {errors.image_url ? (
            <p className="mt-1.5 text-sm text-danger-600">{errors.image_url.message}</p>
          ) : null}
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isSubmitting} disabled={isSubmitting}>
            Add profile
          </Button>
        </div>
      </form>
    </Modal>
  );
}
