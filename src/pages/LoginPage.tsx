import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useLocation } from 'react-router-dom';
import { loginSchema, type LoginFormValues } from '@/schemas/auth.schema';
import { useLoginMutation } from '@/features/auth/authApi';
import { useAppDispatch } from '@/app/hooks';
import { credentialsSet } from '@/features/auth/authSlice';
import { getApiErrorMessage } from '@/lib/apiError';
import { Label } from '@/components/ui/Label';
import { Input } from '@/components/ui/Input';
import { PasswordInput } from '@/components/ui/PasswordInput';
import { Button } from '@/components/ui/Button';

export function LoginPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [login, { isLoading }] = useLoginMutation();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (values: LoginFormValues) => {
    setFormError(null);
    try {
      const { user, access_token, refresh_token } = await login(values).unwrap();
      dispatch(
        credentialsSet({ user, accessToken: access_token, refreshToken: refresh_token }),
      );

      // Send the user back to the page they were trying to reach, if any.
      const redirectTo = (location.state as { from?: string } | null)?.from ?? '/';
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setFormError(getApiErrorMessage(err));
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-slate-900">Welcome back</h1>
        <p className="mt-1 text-sm text-slate-500">Sign in to your account to continue.</p>
      </div>

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
          <Label htmlFor="login">Username or email</Label>
          <Input
            id="login"
            type="text"
            autoComplete="username"
            error={errors.login?.message}
            {...register('login')}
          />
          {errors.login ? (
            <p className="mt-1.5 text-sm text-danger-600">{errors.login.message}</p>
          ) : null}
        </div>

        <div>
          <Label htmlFor="password">Password</Label>
          <PasswordInput
            id="password"
            autoComplete="current-password"
            error={errors.password?.message}
            {...register('password')}
          />
          {errors.password ? (
            <p className="mt-1.5 text-sm text-danger-600">{errors.password.message}</p>
          ) : null}
        </div>

        <Button type="submit" isLoading={isLoading} disabled={isLoading} className="w-full">
          Sign in
        </Button>
      </form>
    </div>
  );
}
