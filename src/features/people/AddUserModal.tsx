import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createUserSchema, type CreateUserFormValues } from '@/schemas/createUser.schema';
import { useCreateUserMutation } from '@/features/people/peopleApi';
import { getApiErrorMessage } from '@/lib/apiError';
import { Modal } from '@/components/ui/Modal';
import { Label } from '@/components/ui/Label';
import { Input } from '@/components/ui/Input';
import { PasswordInput } from '@/components/ui/PasswordInput';
import { Button } from '@/components/ui/Button';

interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/** Admin-only "create a user account" form — POST /users, then the list refetches via the 'User' tag. */
export function AddUserModal({ isOpen, onClose }: AddUserModalProps) {
  const [createUser, { isLoading }] = useCreateUserMutation();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateUserFormValues>({
    resolver: zodResolver(createUserSchema),
  });

  const handleClose = () => {
    reset();
    setFormError(null);
    onClose();
  };

  const onSubmit = async (values: CreateUserFormValues) => {
    setFormError(null);
    try {
      await createUser(values).unwrap();
      handleClose();
    } catch (err) {
      setFormError(getApiErrorMessage(err));
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Add user">
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
          <Label htmlFor="username">Username</Label>
          <Input
            id="username"
            type="text"
            autoComplete="off"
            error={errors.username?.message}
            {...register('username')}
          />
          {errors.username ? (
            <p className="mt-1.5 text-sm text-danger-600">{errors.username.message}</p>
          ) : null}
        </div>

        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            autoComplete="off"
            error={errors.email?.message}
            {...register('email')}
          />
          {errors.email ? (
            <p className="mt-1.5 text-sm text-danger-600">{errors.email.message}</p>
          ) : null}
        </div>

        <div>
          <Label htmlFor="password">Password</Label>
          <PasswordInput
            id="password"
            autoComplete="new-password"
            error={errors.password?.message}
            {...register('password')}
          />
          {errors.password ? (
            <p className="mt-1.5 text-sm text-danger-600">{errors.password.message}</p>
          ) : null}
        </div>

        <div>
          <Label htmlFor="password_confirmation">Confirm password</Label>
          <PasswordInput
            id="password_confirmation"
            autoComplete="new-password"
            error={errors.password_confirmation?.message}
            {...register('password_confirmation')}
          />
          {errors.password_confirmation ? (
            <p className="mt-1.5 text-sm text-danger-600">
              {errors.password_confirmation.message}
            </p>
          ) : null}
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isLoading} disabled={isLoading}>
            Create user
          </Button>
        </div>
      </form>
    </Modal>
  );
}
