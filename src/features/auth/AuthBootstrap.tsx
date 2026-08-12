import { useEffect, useState, type ReactNode } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { fetchCurrentUser } from '@/features/auth/authSlice';
// import { Spinner } from '@/components/ui/Spinner';
// import { Button } from '@/components/ui/Button';
import {Button,Spinner} from '@/components/ui/index';
interface AuthBootstrapProps {
  children: ReactNode;
}

/**
 * Resolves the logged-in user on app load. Only the tokens are persisted to
 * localStorage, so after a page refresh we have an access token but no user
 * yet — this fetches GET /me to fill it back in before rendering routes.
 *
 * A 401 here is already handled centrally by the axios interceptor (refresh
 * + retry, or log out if the refresh itself fails) — by the time an error
 * reaches this component, it's either a refresh-failure logout (in which
 * case `accessToken` is already null, so `shouldResolveUser` is already
 * false below and this branch never renders) or an unrelated failure like a
 * 500 or network error, which gets a retry instead of logging the user out.
 */
export function AuthBootstrap({ children }: AuthBootstrapProps) {
  const dispatch = useAppDispatch();
  const accessToken = useAppSelector((state) => state.auth.accessToken);
  const user = useAppSelector((state) => state.auth.user);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const shouldResolveUser = Boolean(accessToken) && !user;

  useEffect(() => {
    if (!shouldResolveUser) return;

    let cancelled = false;
    setIsLoading(true);
    setIsError(false);

    dispatch(fetchCurrentUser())
      .unwrap()
      .catch(() => {
        if (!cancelled) setIsError(true);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [shouldResolveUser, retryCount, dispatch]);

  if (shouldResolveUser && isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface-subtle">
        <Spinner className="h-8 w-8 text-primary-600" />
      </div>
    );
  }

  if (shouldResolveUser && isError) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-surface-subtle px-4 text-center">
        <p className="text-sm text-slate-500">Couldn't reach the server. Please try again.</p>
        <Button variant="secondary" onClick={() => setRetryCount((count) => count + 1)}>
          Retry
        </Button>
      </div>
    );
  }

  return children;
}
