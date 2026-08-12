import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useAppSelector } from '@/app/hooks';
import { getTeam, assignLead, unassignLead, assignMember, unassignMember } from '@/services/teamService';
import { AssignUsernameModal } from '@/features/teams/AssignUsernameModal';
import { getApiErrorMessage } from '@/lib/apiError';
import { formatDateSafe } from '@/lib/formatDate';
import type { Team } from '@/types/teams';
import { Button } from '@/components/ui/Button';
import { DetailRow } from '@/components/ui/DetailRow';

function BackLink() {
  return (
    <Link
      to="/teams"
      className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900"
    >
      <ArrowLeft className="h-4 w-4" aria-hidden="true" />
      Back to Teams
    </Link>
  );
}

function DetailSkeleton() {
  return (
    <div className="rounded-lg border border-border bg-white p-6">
      <div className="space-y-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="h-8 animate-pulse rounded bg-slate-200" />
        ))}
      </div>
    </div>
  );
}

export function TeamDetailPage() {
  const { id } = useParams();
  const teamId = Number(id);
  const isValidId = id !== undefined && !Number.isNaN(teamId);

  const viewerRole = useAppSelector((state) => state.auth.user?.employment_detail?.role);

  const [data, setData] = useState<Team>();
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const reload = () => setReloadKey((key) => key + 1);

  const [isAssignLeadOpen, setIsAssignLeadOpen] = useState(false);
  const [isAssignMemberOpen, setIsAssignMemberOpen] = useState(false);
  const [isUnassignMemberOpen, setIsUnassignMemberOpen] = useState(false);
  const [isUnassigningLead, setIsUnassigningLead] = useState(false);
  const [unassignLeadError, setUnassignLeadError] = useState<string | null>(null);

  useEffect(() => {
    if (!isValidId) return;

    let cancelled = false;
    setIsLoading(true);
    setIsError(false);

    getTeam(teamId)
      .then((team) => {
        if (!cancelled) setData(team);
      })
      .catch(() => {
        if (!cancelled) setIsError(true);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isValidId, teamId, reloadKey]);

  const handleUnassignLead = async () => {
    setUnassignLeadError(null);
    setIsUnassigningLead(true);
    try {
      await unassignLead(teamId);
      reload();
    } catch (err) {
      setUnassignLeadError(getApiErrorMessage(err));
    } finally {
      setIsUnassigningLead(false);
    }
  };

  if (!isValidId) {
    return (
      <div>
        <BackLink />
        <p className="text-sm text-slate-500">Invalid team id.</p>
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
          <span>Couldn't load this team.</span>
          <Button variant="secondary" size="sm" onClick={reload}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <BackLink />

      <div className="rounded-lg border border-border bg-white p-6">
        <h1 className="text-base font-semibold text-slate-900">{data.name}</h1>

        <div className="mt-4 divide-y divide-border">
          <DetailRow label="Team lead ID" value={data.team_lead_id !== null ? String(data.team_lead_id) : null} />
          <DetailRow label="Team lead" value={data.team_lead_name} />
          <DetailRow label="Description" value={data.description} />
          <DetailRow label="Created" value={formatDateSafe(data.created_at, 'MMMM d, yyyy')} />
        </div>

        {viewerRole === 'admin' ? (
          <div className="mt-6 border-t border-border pt-6">
            {unassignLeadError ? (
              <div
                role="alert"
                className="mb-4 rounded-md bg-danger-50 px-3 py-2 text-sm text-danger-700"
              >
                {unassignLeadError}
              </div>
            ) : null}

            <div className="flex flex-wrap gap-2">
              {data.team_lead_id === null ? (
                <Button variant="secondary" size="sm" onClick={() => setIsAssignLeadOpen(true)}>
                  Assign lead
                </Button>
              ) : (
                <Button
                  variant="secondary"
                  size="sm"
                  isLoading={isUnassigningLead}
                  disabled={isUnassigningLead}
                  onClick={handleUnassignLead}
                >
                  Unassign lead
                </Button>
              )}
              <Button variant="secondary" size="sm" onClick={() => setIsAssignMemberOpen(true)}>
                Assign member
              </Button>
              <Button variant="secondary" size="sm" onClick={() => setIsUnassignMemberOpen(true)}>
                Unassign member
              </Button>
            </div>
          </div>
        ) : null}
      </div>

      <AssignUsernameModal
        isOpen={isAssignLeadOpen}
        onClose={() => setIsAssignLeadOpen(false)}
        title="Assign lead"
        submitLabel="Assign lead"
        onSubmit={async (username) => {
          await assignLead(teamId, username);
        }}
        onSuccess={reload}
      />
      <AssignUsernameModal
        isOpen={isAssignMemberOpen}
        onClose={() => setIsAssignMemberOpen(false)}
        title="Assign member"
        submitLabel="Assign member"
        onSubmit={async (username) => {
          await assignMember(teamId, username);
        }}
      />
      <AssignUsernameModal
        isOpen={isUnassignMemberOpen}
        onClose={() => setIsUnassignMemberOpen(false)}
        title="Unassign member"
        submitLabel="Unassign member"
        onSubmit={async (username) => {
          await unassignMember(teamId, username);
        }}
      />
    </div>
  );
}
