import { Navigate, Outlet } from 'react-router-dom';
import { useAppSelector } from '@/app/hooks';
import type { UserRole } from '@/types/auth';

interface RoleGuardProps {
  allowedRoles: UserRole[];
}

/**
 * Nest under <ProtectedRoute> for routes that only some roles may access
 * (e.g. admin-only settings, team-lead-only team management).
 * Usage: <Route element={<RoleGuard allowedRoles={['admin']} />}>...</Route>
 */
export function RoleGuard({ allowedRoles }: RoleGuardProps) {
  const role = useAppSelector((state) => state.auth.user?.employment_detail?.role);

  if (!role || !allowedRoles.includes(role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
}
