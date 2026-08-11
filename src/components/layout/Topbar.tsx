import { LogOut } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { loggedOut } from '@/features/auth/authSlice';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { ROLE_LABELS } from '@/lib/roles';

export function Topbar() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);

  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-white px-6">
      <div />

      {user ? (
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <Avatar
              src={user.profile?.image_url ?? null}
              name={user.profile?.full_name ?? user.username}
              size="sm"
            />
            <div className="hidden sm:flex sm:items-center sm:gap-2">
              <span className="text-sm font-medium text-slate-900">
                {user.profile?.full_name ?? user.username}
              </span>
              {user.employment_detail ? (
                <Badge variant="primary">{ROLE_LABELS[user.employment_detail.role]}</Badge>
              ) : null}
            </div>
          </div>

          <button
            type="button"
            onClick={() => dispatch(loggedOut())}
            className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-sm font-medium text-slate-600 hover:bg-surface-subtle hover:text-slate-900"
          >
            <LogOut className="h-4 w-4" aria-hidden="true" />
            Log out
          </button>
        </div>
      ) : null}
    </header>
  );
}
