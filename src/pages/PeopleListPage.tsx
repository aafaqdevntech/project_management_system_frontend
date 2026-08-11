import { useState } from 'react';
import { Link } from 'react-router-dom';
import { UserPlus } from 'lucide-react';
import { useAppSelector } from '@/app/hooks';
import { useGetUsersQuery } from '@/features/people/peopleApi';
import {
  groupUsers,
  filterUsers,
  hasTeam,
  normalizeRole,
  FILTER_ORDER,
  FILTER_LABELS,
  type PeopleFilter,
} from '@/features/people/peopleGrouping';
import { AddUserModal } from '@/features/people/AddUserModal';
import type { UserListItem } from '@/types/users';
import { normalizeSentinel } from '@/lib/sentinel';
import { formatDateSafe } from '@/lib/formatDate';
import { ROLE_LABELS, ROLE_BADGE_VARIANT } from '@/lib/roles';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Table, type Column } from '@/components/ui/Table';

const columns: Column<UserListItem>[] = [
  {
    key: 'user',
    header: 'User',
    render: (row) => (
      <div className="flex items-center gap-3">
        <Avatar src={normalizeSentinel(row.image_url)} name={row.username} size="sm" />
        <span className="font-medium text-slate-900">{row.username}</span>
      </div>
    ),
  },
  {
    key: 'email',
    header: 'Email',
    render: (row) => row.email,
  },
  {
    key: 'role',
    header: 'Role',
    render: (row) => {
      const role = normalizeRole(row.role);
      return role ? (
        <Badge variant={ROLE_BADGE_VARIANT[role]}>{ROLE_LABELS[role]}</Badge>
      ) : (
        <Badge variant="neutral">Not set</Badge>
      );
    },
  },
  {
    key: 'team',
    header: 'Team',
    render: (row) =>
      hasTeam(row) ? (
        <Badge variant="info">{row.team_name}</Badge>
      ) : (
        <Badge variant="neutral">No team</Badge>
      ),
  },
  {
    key: 'job_position',
    header: 'Job position',
    render: (row) => normalizeSentinel(row.job_position) ?? '—',
  },
  {
    key: 'joined_at',
    header: 'Joined',
    render: (row) => formatDateSafe(normalizeSentinel(row.joined_at), 'MMM d, yyyy'),
  },
  {
    key: 'actions',
    header: 'Actions',
    render: (row) => (
      <Link to={`/people/${row.id}`}>
        <Button variant="ghost" size="sm">
          View
        </Button>
      </Link>
    ),
    className: 'text-right',
  },
];

function TableSkeleton() {
  return (
    <div className="space-y-2 rounded-lg border border-border bg-white p-4">
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="h-10 animate-pulse rounded bg-slate-200" />
      ))}
    </div>
  );
}

export function PeopleListPage() {
  const [filter, setFilter] = useState<PeopleFilter>('all');
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const viewerRole = useAppSelector((state) => state.auth.user?.employment_detail?.role);
  const { data, isLoading, isError, refetch } = useGetUsersQuery();

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-slate-900">People</h1>
        {viewerRole === 'admin' ? (
          <Button size="sm" onClick={() => setIsAddUserOpen(true)}>
            <UserPlus className="h-4 w-4" aria-hidden="true" />
            Add user
          </Button>
        ) : null}
      </div>

      <AddUserModal isOpen={isAddUserOpen} onClose={() => setIsAddUserOpen(false)} />

      <div className="mt-4 flex flex-wrap gap-2">
        {FILTER_ORDER.map((option) => (
          <Button
            key={option}
            variant={filter === option ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setFilter(option)}
          >
            {FILTER_LABELS[option]}
          </Button>
        ))}
      </div>

      <div className="mt-4">
        {isLoading ? (
          <TableSkeleton />
        ) : isError ? (
          <div className="flex items-center justify-between rounded-lg border border-border bg-white px-4 py-3 text-sm text-slate-600">
            <span>Couldn't load people.</span>
            <Button variant="secondary" size="sm" onClick={() => refetch()}>
              Retry
            </Button>
          </div>
        ) : filter === 'all' ? (
          <div className="space-y-6">
            {groupUsers(data ?? []).map((group) => (
              <section key={group.bucket}>
                <h2 className="mb-2 text-sm font-semibold text-slate-700">
                  {group.label}{' '}
                  <span className="font-normal text-slate-400">({group.users.length})</span>
                </h2>
                <Table columns={columns} data={group.users} rowKey={(row) => row.id} />
              </section>
            ))}
          </div>
        ) : (
          <Table
            columns={columns}
            data={filterUsers(data ?? [], filter)}
            rowKey={(row) => row.id}
            emptyMessage="No people match this filter."
          />
        )}
      </div>
    </div>
  );
}
