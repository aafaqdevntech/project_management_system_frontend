import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useAppSelector } from '@/app/hooks';
import { useGetUserQuery } from '@/features/people/peopleApi';
import { getDetailActionsForRole, PLACEHOLDER_ACTION_TITLE } from '@/features/people/actions';
import { AddProfileModal } from '@/features/people/AddProfileModal';
import { AddEmploymentModal } from '@/features/people/AddEmploymentModal';
import { ROLE_LABELS } from '@/lib/roles';
import { formatDateSafe } from '@/lib/formatDate';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { DetailRow } from '@/components/ui/DetailRow';

function BackLink() {
  return (
    <Link
      to="/people"
      className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900"
    >
      <ArrowLeft className="h-4 w-4" aria-hidden="true" />
      Back to People
    </Link>
  );
}

function DetailSkeleton() {
  return (
    <div className="rounded-lg border border-border bg-white p-6">
      <div className="flex flex-col items-center">
        <div className="h-16 w-16 animate-pulse rounded-full bg-slate-200" />
        <div className="mt-3 h-5 w-32 animate-pulse rounded bg-slate-200" />
        <div className="mt-2 h-4 w-24 animate-pulse rounded bg-slate-200" />
      </div>
      <div className="mt-6 space-y-2">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="h-8 animate-pulse rounded bg-slate-200" />
        ))}
      </div>
    </div>
  );
}

export function PeopleDetailPage() {
  const { id } = useParams();
  const userId = Number(id);
  const isValidId = id !== undefined && !Number.isNaN(userId);
  const [isAddProfileOpen, setIsAddProfileOpen] = useState(false);
  const [isAddEmploymentOpen, setIsAddEmploymentOpen] = useState(false);

  const viewerRole = useAppSelector((state) => state.auth.user?.employment_detail?.role);
  const { data, isLoading, isError, refetch } = useGetUserQuery(userId, {
    skip: !isValidId,
  });

  if (!isValidId) {
    return (
      <div>
        <BackLink />
        <p className="text-sm text-slate-500">Invalid user id.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div>
        <BackLink />
        <DetailSkeleton />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div>
        <BackLink />
        <div className="flex items-center justify-between rounded-lg border border-border bg-white px-4 py-3 text-sm text-slate-600">
          <span>Couldn't load this person.</span>
          <Button variant="secondary" size="sm" onClick={() => refetch()}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  // A freshly created user (via Add User) has no profile/employment_detail
  // record yet — confirmed live: GET /users/{id} returns both as null until
  // an admin sets a role/team/profile via the actions below.
  const actions = viewerRole
    ? getDetailActionsForRole(
        viewerRole,
        Boolean(data.employment_detail?.team_id),
        Boolean(data.profile),
        Boolean(data.employment_detail),
      )
    : [];

  return (
    <div>
      <BackLink />

      <div className="rounded-lg border border-border bg-white p-6">
        <div className="flex flex-col items-center text-center">
          <Avatar
            src={data.profile?.image_url ?? null}
            name={data.profile?.full_name ?? data.username}
            size="lg"
          />
          <h1 className="mt-3 text-base font-semibold text-slate-900">
            {data.profile?.full_name ?? data.username}
          </h1>
          <p className="text-sm text-slate-500">@{data.username}</p>
          <div className="mt-2">
            <Badge variant={data.employment_detail ? 'primary' : 'neutral'}>
              {data.employment_detail ? ROLE_LABELS[data.employment_detail.role] : 'Not set'}
            </Badge>
          </div>
        </div>

        <div className="mt-6">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Contact
          </h2>
          <div className="mt-1 divide-y divide-border">
            <DetailRow label="Email" value={data.email} />
            <DetailRow label="Phone" value={data.profile?.phone ?? null} />
            <DetailRow label="Address" value={data.profile?.address ?? null} />
            <DetailRow label="City" value={data.profile?.city ?? null} />
            <DetailRow label="Country" value={data.profile?.country ?? null} />
          </div>
        </div>

        <div className="mt-6">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Employment
          </h2>
          <div className="mt-1 divide-y divide-border">
            <DetailRow label="Job position" value={data.employment_detail?.job_position ?? null} />
            <DetailRow
              label="Team"
              value={
                data.employment_detail?.team_id ? `Team #${data.employment_detail.team_id}` : null
              }
            />
            <DetailRow
              label="Joined"
              value={
                data.employment_detail
                  ? formatDateSafe(data.employment_detail.joined_at, 'MMMM d, yyyy')
                  : null
              }
            />
          </div>
        </div>

        {actions.length > 0 ? (
          <div className="mt-6 flex flex-wrap gap-2 border-t border-border pt-6">
            {actions.map((action) => {
              if (action.key === 'profile' && !action.disabled) {
                return (
                  <Button
                    key={action.key}
                    variant={action.variant}
                    size="sm"
                    onClick={() => setIsAddProfileOpen(true)}
                  >
                    {action.label}
                  </Button>
                );
              }
              if (action.key === 'employment' && !action.disabled) {
                return (
                  <Button
                    key={action.key}
                    variant={action.variant}
                    size="sm"
                    onClick={() => setIsAddEmploymentOpen(true)}
                  >
                    {action.label}
                  </Button>
                );
              }
              return (
                <Button
                  key={action.key}
                  variant={action.variant}
                  size="sm"
                  disabled
                  title={PLACEHOLDER_ACTION_TITLE}
                >
                  {action.label}
                </Button>
              );
            })}
          </div>
        ) : null}
      </div>

      <AddProfileModal
        isOpen={isAddProfileOpen}
        onClose={() => setIsAddProfileOpen(false)}
        userId={data.id}
      />
      <AddEmploymentModal
        isOpen={isAddEmploymentOpen}
        onClose={() => setIsAddEmploymentOpen(false)}
        userId={data.id}
      />
    </div>
  );
}
