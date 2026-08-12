import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useAppSelector } from '@/app/hooks';
import { getIssue } from '@/services/issueService';
import { getProject } from '@/services/projectService';
import { getTeam } from '@/services/teamService';
import { ChangeIssueStatusModal } from '@/features/projects/ChangeIssueStatusModal';
import { formatDateSafe } from '@/lib/formatDate';
import type { Project } from '@/types/projects';
import type { Team } from '@/types/teams';
import type { Issue } from '@/types/issues';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { DetailRow } from '@/components/ui/DetailRow';

function DetailSkeleton() {
  return (
    <div className="rounded-lg border border-border bg-white p-6">
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="h-8 animate-pulse rounded bg-slate-200" />
        ))}
      </div>
    </div>
  );
}

export function IssueDetailPage() {
  const { projectId: projectIdParam, issueId: issueIdParam } = useParams();
  const projectId = Number(projectIdParam);
  const issueId = Number(issueIdParam);
  const isValidId =
    projectIdParam !== undefined &&
    !Number.isNaN(projectId) &&
    issueIdParam !== undefined &&
    !Number.isNaN(issueId);

  const currentUser = useAppSelector((state) => state.auth.user);

  const [issue, setIssue] = useState<Issue>();
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const reload = () => setReloadKey((key) => key + 1);

  const [project, setProject] = useState<Project>();
  const [team, setTeam] = useState<Team | null>(null);
  const [isStatusOpen, setIsStatusOpen] = useState(false);

  const isProjectTeamLead = Boolean(team && currentUser && team.team_lead_id === currentUser.id);

  // Primary: the issue itself — drives loading/error.
  useEffect(() => {
    if (!isValidId) return;

    let cancelled = false;
    setIsLoading(true);
    setIsError(false);

    getIssue(issueId)
      .then((data) => {
        if (!cancelled) setIssue(data);
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
  }, [isValidId, issueId, reloadKey]);

  // Secondary/best-effort: project + team, only needed to gate the
  // team-lead-only "Change status" button — must never hide the issue itself.
  useEffect(() => {
    if (!isValidId) return;
    let cancelled = false;

    getProject(projectId)
      .then((proj) => {
        if (!cancelled) setProject(proj);
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [isValidId, projectId]);

  useEffect(() => {
    if (!project || project.team_id === null) {
      setTeam(null);
      return;
    }

    let cancelled = false;
    getTeam(project.team_id)
      .then((projectTeam) => {
        if (!cancelled) setTeam(projectTeam);
      })
      .catch(() => {
        if (!cancelled) setTeam(null);
      });

    return () => {
      cancelled = true;
    };
  }, [project]);

  const backLink = (
    <Link
      to={isValidId ? `/projects/${projectId}` : '/projects'}
      className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900"
    >
      <ArrowLeft className="h-4 w-4" aria-hidden="true" />
      Back to project
    </Link>
  );

  if (!isValidId) {
    return (
      <div>
        {backLink}
        <p className="text-sm text-slate-500">Invalid issue id.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div>
        {backLink}
        <DetailSkeleton />
      </div>
    );
  }

  if (isError || !issue) {
    return (
      <div>
        {backLink}
        <div className="flex items-center justify-between rounded-lg border border-border bg-white px-4 py-3 text-sm text-slate-600">
          <span>Couldn't load this issue.</span>
          <Button variant="secondary" size="sm" onClick={reload}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {backLink}

      <div className="rounded-lg border border-border bg-white p-6">
        <div className="flex items-center justify-between">
          <h1 className="text-base font-semibold text-slate-900">{issue.title}</h1>
          <Badge>{issue.status}</Badge>
        </div>

        <div className="mt-4 divide-y divide-border">
          <DetailRow label="Description" value={issue.description} />
          <DetailRow label="Raised by" value={issue.raised_by_name} />
          <DetailRow label="Resolution note" value={issue.resolution_note} />
          <DetailRow label="Created" value={formatDateSafe(issue.created_at, 'MMMM d, yyyy')} />
          <DetailRow label="Updated" value={formatDateSafe(issue.updated_at, 'MMMM d, yyyy')} />
        </div>

        {isProjectTeamLead && issue.status === 'open' ? (
          <div className="mt-6 border-t border-border pt-6">
            <Button size="sm" onClick={() => setIsStatusOpen(true)}>
              Change status
            </Button>
          </div>
        ) : null}
      </div>

      <ChangeIssueStatusModal
        isOpen={isStatusOpen}
        onClose={() => setIsStatusOpen(false)}
        onSuccess={reload}
        issueId={issue.id}
      />
    </div>
  );
}
