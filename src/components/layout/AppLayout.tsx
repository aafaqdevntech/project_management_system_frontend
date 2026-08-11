import { Outlet } from 'react-router-dom';
import { useAppSelector } from '@/app/hooks';
import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';

/** Shell for every authenticated page: fixed sidebar + topbar, scrollable content area. */
export function AppLayout() {
  const user = useAppSelector((state) => state.auth.user);

  // AuthBootstrap resolves `user` before any protected route renders; this
  // is just a type-narrowing guard, not an expected runtime case.
  if (!user) return null;

  // A freshly created account (via Add User) has no profile/employment_detail
  // yet, confirmed live. Sidebar, Topbar, ProfileModal, and the Dashboard all
  // assume the logged-in user has both, so that assumption is enforced once
  // here rather than null-checked in every one of those components.
  if (!user.profile || !user.employment_detail) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-2 bg-surface-subtle px-4 text-center">
        <h1 className="text-lg font-semibold text-slate-900">Account setup incomplete</h1>
        <p className="max-w-sm text-sm text-slate-500">
          Your profile and role haven't been set up yet. Contact an admin to finish setting up
          your account.
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-surface-subtle">
      <Sidebar />

      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar />

        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
