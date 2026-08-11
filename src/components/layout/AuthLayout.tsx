import { Outlet } from 'react-router-dom';

/** Shell for public/unauthenticated pages (login, register, forgot password, ...). */
export function AuthLayout() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-subtle px-4">
      <div className="w-full max-w-sm rounded-lg border border-border bg-white p-8 shadow-sm">
        <Outlet />
      </div>
    </div>
  );
}
