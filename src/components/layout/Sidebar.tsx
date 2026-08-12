import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, Building2, FolderKanban, CheckSquare, AlertCircle } from 'lucide-react';
import type { UserRole } from '@/types/auth';
import { useAppSelector } from '@/app/hooks';
import { Avatar } from '@/components/ui/Avatar';
import { ROLE_LABELS } from '@/lib/roles';
import { ProfileModal } from '@/components/layout/ProfileModal';

interface NavItem {
  label: string;
  to: string;
  icon: typeof LayoutDashboard;
  /** Omit to show the item to every role. */
  allowedRoles?: UserRole[];
}

/**
 * Central nav list for the authenticated app shell. As feature pages are
 * added (projects, teams, issues, tasks, admin panels, ...) register them
 * here with the roles allowed to see the link — the array is filtered
 * against the current user's role below.
 */
const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', to: '/', icon: LayoutDashboard },
  { label: 'People', to: '/people', icon: Users },
  { label: 'Teams', to: '/teams', icon: Building2, allowedRoles: ['admin'] },
  { label: 'Projects', to: '/projects', icon: FolderKanban },
  { label: 'Tasks', to: '/tasks', icon: CheckSquare },
  { label: 'Issues', to: '/issues', icon: AlertCircle },
];

export function Sidebar() {
  const user = useAppSelector((state) => state.auth.user);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const visibleItems = NAV_ITEMS.filter(
    (item) =>
      !item.allowedRoles ||
      (user?.employment_detail && item.allowedRoles.includes(user.employment_detail.role)),
  );

  return (
    <aside className="hidden w-60 shrink-0 border-r border-border bg-white md:flex md:flex-col">
      <div className="flex h-16 items-center px-6">
        <span className="text-lg font-semibold text-slate-900">PMS</span>
      </div>

      <nav className="flex flex-1 flex-col gap-1 px-3 py-2">
        {visibleItems.map(({ label, to, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-slate-600 hover:bg-surface-subtle hover:text-slate-900'
              }`
            }
          >
            <Icon className="h-4 w-4" aria-hidden="true" />
            {label}
          </NavLink>
        ))}
      </nav>

      {user ? (
        <div className="border-t border-border p-3">
          <button
            type="button"
            onClick={() => setIsProfileOpen(true)}
            className="flex w-full items-center gap-3 rounded-md px-2 py-2 text-left hover:bg-surface-subtle"
          >
            <Avatar
              src={user.profile?.image_url ?? null}
              name={user.profile?.full_name ?? user.username}
              size="sm"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-slate-900">
                {user.profile?.full_name ?? user.username}
              </p>
              <p className="truncate text-xs text-slate-500">
                {user.employment_detail ? ROLE_LABELS[user.employment_detail.role] : 'Not set'}
              </p>
            </div>
          </button>

          <ProfileModal
            isOpen={isProfileOpen}
            onClose={() => setIsProfileOpen(false)}
            user={user}
          />
        </div>
      ) : null}
    </aside>
  );
}
