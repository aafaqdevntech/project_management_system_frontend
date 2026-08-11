import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAppSelector } from '@/app/hooks';

/** Blocks unauthenticated access; redirects to /login and remembers where the user came from. */
export function ProtectedRoute() {
  const token = useAppSelector((state) => state.auth.accessToken);
  const location = useLocation();

  if (!token) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  return <Outlet />;
}
