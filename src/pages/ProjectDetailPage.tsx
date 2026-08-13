import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Plus } from 'lucide-react';
import { useAppSelector } from '@/app/hooks';
import { getProject, unassignTeamFromProject } from '@/services/projectService';
import { getProjectTasks } from '@/services/taskService';
import { getProjectIssues } from '@/services/issueService';
import { getTeam } from '@/services/teamService';
import { EditProjectModal } from '@/features/projects/EditProjectModal';
import { ChangeProjectStatusModal } from '@/features/projects/ChangeProjectStatusModal';
import { AssignTeamModal } from '@/features/projects/AssignTeamModal';
import { AddTaskModal } from '@/features/projects/AddTaskModal';
import { AddIssueModal } from '@/features/projects/AddIssueModal';
import { getApiErrorMessage, isForbiddenError } from '@/lib/apiError';
import { formatDateSafe } from '@/lib/formatDate';
import { PROJECT_STATUS_LABELS, PROJECT_STATUS_BADGE_VARIANT } from '@/lib/projectStatus';
import { TASK_PRIORITY_BADGE_VARIANT } from '@/lib/taskPriority';
import { TASK_STATUS_LABELS, TASK_STATUS_BADGE_VARIANT } from '@/lib/taskStatus';
import type { Project } from '@/types/projects';
import type { Team } from '@/types/teams';
import type { Task } from '@/types/tasks';
import type { Issue } from '@/types/issues';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { DetailRow } from '@/components/ui/DetailRow';
import { Table, type Column } from '@/components/ui/Table';

const taskColumns: Column<Task>[] = [
  { key: 'title', header: 'Title', render: (row) => row.title },
  {
    key: 'priority',
    header: 'Priority',
    render: (row) => <Badge variant={TASK_PRIORITY_BADGE_VARIANT[row.priority]}>{row.priority}</Badge>,
  },
  {
    key: 'status',
    header: 'Status',
    render: (row) => (
      <Badge variant={TASK_STATUS_BADGE_VARIANT[row.status]}>{TASK_STATUS_LABELS[row.status]}</Badge>
    ),
  },
  { key: 'due_date', header: 'Due date', render: (row) => formatDateSafe(row.due_date, 'MMM d, yyyy') },
  {
    key: 'assigned_to',
    header: 'Assigned to',
    render: (row) => row.assigned_to_name ?? 'Unassigned',
  },
  {
    key: 'actions',
    header: 'Actions',
    render: (row) => (
      <Link to={`/projects/${row.project_id}/tasks/${row.id}`}>
        <Button variant="ghost" size="sm">
          View
        </Button>
      </Link>
    ),
    className: 'text-right',
  },
];

const issueColumns: Column<Issue>[] = [
  { key: 'title', header: 'Title', render: (row) => row.title },
  { key: 'status', header: 'Status', render: (row) => <Badge>{row.status}</Badge> },
  { key: 'raised_by', header: 'Raised by', render: (row) => row.raised_by_name },
  { key: 'created_at', header: 'Created', render: (row) => formatDateSafe(row.created_at, 'MMM d, yyyy') },
  {
    key: 'actions',
    header: 'Actions',
    render: (row) => (
      <Link to={`/projects/${row.project_id}/issues/${row.id}`}>
        <Button variant="ghost" size="sm">
          View
        </Button>
      </Link>
    ),
    className: 'text-right',
  },
];

function BackLink() {
  return (
    <Link
      to="/projects"
      className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900"
    >
      <ArrowLeft className="h-4 w-4" aria-hidden="true" />
      Back to Projects
    </Link>
  );
}

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

export function ProjectDetailPage() {
  const { id } = useParams();
  const projectId = Number(id);
  const isValidId = id !== undefined && !Number.isNaN(projectId);

  const currentUser = useAppSelector((state) => state.auth.user);
  const viewerRole = currentUser?.employment_detail?.role;
  const viewerTeamId = currentUser?.employment_detail?.team_id ?? null;

  const [project, setProject] = useState<Project>();
  const [team, setTeam] = useState<Team | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [isForbidden, setIsForbidden] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const reload = () => setReloadKey((key) => key + 1);

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [isAssignTeamOpen, setIsAssignTeamOpen] = useState(false);
  const [isUnassigningTeam, setIsUnassigningTeam] = useState(false);
  const [unassignTeamError, setUnassignTeamError] = useState<string | null>(null);
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [isAddIssueOpen, setIsAddIssueOpen] = useState(false);

  const [tasks, setTasks] = useState<Task[]>();
  const [tasksError, setTasksError] = useState(false);
  const [tasksReloadKey, setTasksReloadKey] = useState(0);
  const reloadTasks = () => setTasksReloadKey((key) => key + 1);

  const [issues, setIssues] = useState<Issue[]>();
  const [issuesError, setIssuesError] = useState(false);
  const [issuesReloadKey, setIssuesReloadKey] = useState(0);
  const reloadIssues = () => setIssuesReloadKey((key) => key + 1);

  useEffect(() => {
    if (!isValidId) return;

    let cancelled = false;
    setIsLoading(true);
    setIsError(false);
    setIsForbidden(false);

    getProject(projectId)
      .then((proj) => {
        if (!cancelled) setProject(proj);
      })
      .catch((err) => {
        if (cancelled) return;
        if (isForbiddenError(err)) setIsForbidden(true);
        else setIsError(true);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isValidId, projectId, reloadKey]);

  useEffect(() => {
    if (!project || project.team_id === null) {
      setTeam(null);
      return;
    }

    let cancelled = false;
    // The team lookup is a display/permission nicety (name + lead check) —
    // if it fails (e.g. the caller isn't an admin), fall back to `team_id`
    // showing as a raw number and hide the lead-only "Add task" button; it
    // must never hide the project itself.
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

  useEffect(() => {
    if (!project) return;
    let cancelled = false;
    setTasksError(false);

    getProjectTasks(project.id)
      .then((data) => {
        if (!cancelled) setTasks(data);
      })
      .catch(() => {
        if (!cancelled) setTasksError(true);
      });

    return () => {
      cancelled = true;
    };
  }, [project, tasksReloadKey]);

  useEffect(() => {
    if (!project) return;
    let cancelled = false;
    setIssuesError(false);

    getProjectIssues(project.id)
      .then((data) => {
        if (!cancelled) setIssues(data);
      })
      .catch(() => {
        if (!cancelled) setIssuesError(true);
      });

    return () => {
      cancelled = true;
    };
  }, [project, issuesReloadKey]);

  const handleUnassignTeam = async () => {
    if (!project) return;
    setUnassignTeamError(null);
    setIsUnassigningTeam(true);
    try {
      await unassignTeamFromProject(project.id);
      reload();
    } catch (err) {
      setUnassignTeamError(getApiErrorMessage(err));
    } finally {
      setIsUnassigningTeam(false);
    }
  };

  if (!isValidId) {
    return (
      <div>
        <BackLink />
        <p className="text-sm text-slate-500">Invalid project id.</p>
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

  if (isForbidden) {
    return (
      <div>
        <BackLink />
        <div className="rounded-lg border border-border bg-white px-4 py-3 text-sm text-slate-600">
          You don't have access to this project.
        </div>
      </div>
    );
  }

  if (isError || !project) {
    return (
      <div>
        <BackLink />
        <div className="flex items-center justify-between rounded-lg border border-border bg-white px-4 py-3 text-sm text-slate-600">
          <span>Couldn't load this project.</span>
          <Button variant="secondary" size="sm" onClick={reload}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  // Issues can be raised by anyone on the project's team — team lead or member — just not admins.
  const canRaiseIssue =
    (viewerRole === 'team_lead' || viewerRole === 'member') &&
    project.team_id !== null &&
    viewerTeamId === project.team_id;
  const isProjectActive = project.status === 'active';

  // Whether the viewer is literally this project's team lead (per the
  // assign_lead cascade, their employment_detail.team_id always matches the
  // team they lead) — gates "Add task" below (assigning a task now happens
  // on the task's own detail page).
  const isProjectTeamLead = Boolean(team && currentUser && team.team_lead_id === currentUser.id);

  return (
    <div>
      <BackLink />

      <div className="rounded-lg border border-border bg-white p-6">
        <div className="flex items-center justify-between">
          <h1 className="text-base font-semibold text-slate-900">{project.title}</h1>
          <Badge variant={PROJECT_STATUS_BADGE_VARIANT[project.status]}>
            {PROJECT_STATUS_LABELS[project.status]}
          </Badge>
        </div>

        <div className="mt-4 divide-y divide-border">
          <DetailRow label="Description" value={project.description} />
          <DetailRow
            label="Team"
            value={
              project.team_id === null
                ? 'Unassigned'
                : (team?.name ?? `Team #${project.team_id}`)
            }
          />
          <DetailRow label="Start date" value={formatDateSafe(project.start_date, 'MMMM d, yyyy', '—')} />
          <DetailRow label="End date" value={formatDateSafe(project.end_date, 'MMMM d, yyyy', '—')} />
          <DetailRow label="Created" value={formatDateSafe(project.created_at, 'MMMM d, yyyy')} />
          <DetailRow label="Updated" value={formatDateSafe(project.updated_at, 'MMMM d, yyyy')} />
        </div>

        {viewerRole === 'admin' ? (
          <div className="mt-6 border-t border-border pt-6">
            {unassignTeamError ? (
              <div
                role="alert"
                className="mb-4 rounded-md bg-danger-50 px-3 py-2 text-sm text-danger-700"
              >
                {unassignTeamError}
              </div>
            ) : null}

            <div className="flex flex-wrap gap-2">
              <Button variant="secondary" size="sm" onClick={() => setIsEditOpen(true)}>
                Edit project
              </Button>
              <Button variant="secondary" size="sm" onClick={() => setIsStatusOpen(true)}>
                Change status
              </Button>
              {project.team_id === null ? (
                <Button variant="secondary" size="sm" onClick={() => setIsAssignTeamOpen(true)}>
                  Assign team
                </Button>
              ) : (
                <Button
                  variant="secondary"
                  size="sm"
                  isLoading={isUnassigningTeam}
                  disabled={isUnassigningTeam}
                  onClick={handleUnassignTeam}
                >
                  Unassign team
                </Button>
              )}
            </div>
          </div>
        ) : null}
      </div>

      <div className="mt-6 rounded-lg border border-border bg-white p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-slate-900">Tasks</h2>
          {isProjectTeamLead ? (
            <Button
              size="sm"
              disabled={!isProjectActive}
              title={isProjectActive ? undefined : 'Project must be active to add a task'}
              onClick={() => setIsAddTaskOpen(true)}
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              Add task
            </Button>
          ) : null}
        </div>

        <div className="mt-4">
          {tasksError ? (
            <div className="flex items-center justify-between rounded-lg border border-border px-4 py-3 text-sm text-slate-600">
              <span>Couldn't load tasks.</span>
              <Button variant="secondary" size="sm" onClick={reloadTasks}>
                Retry
              </Button>
            </div>
          ) : (
            <Table
              columns={taskColumns}
              data={tasks ?? []}
              rowKey={(row) => row.id}
              emptyMessage="No tasks yet."
            />
          )}
        </div>
      </div>

      <div className="mt-6 rounded-lg border border-border bg-white p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-slate-900">Issues</h2>
          {canRaiseIssue ? (
            <Button
              size="sm"
              disabled={!isProjectActive}
              title={isProjectActive ? undefined : 'Project must be active to raise an issue'}
              onClick={() => setIsAddIssueOpen(true)}
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              Raise issue
            </Button>
          ) : null}
        </div>

        <div className="mt-4">
          {issuesError ? (
            <div className="flex items-center justify-between rounded-lg border border-border px-4 py-3 text-sm text-slate-600">
              <span>Couldn't load issues.</span>
              <Button variant="secondary" size="sm" onClick={reloadIssues}>
                Retry
              </Button>
            </div>
          ) : (
            <Table
              columns={issueColumns}
              data={issues ?? []}
              rowKey={(row) => row.id}
              emptyMessage="No issues yet."
            />
          )}
        </div>
      </div>

      <EditProjectModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        onSuccess={reload}
        project={project}
      />
      <ChangeProjectStatusModal
        isOpen={isStatusOpen}
        onClose={() => setIsStatusOpen(false)}
        onSuccess={reload}
        project={project}
      />
      <AssignTeamModal
        isOpen={isAssignTeamOpen}
        onClose={() => setIsAssignTeamOpen(false)}
        onSuccess={reload}
        projectId={project.id}
      />
      <AddTaskModal
        isOpen={isAddTaskOpen}
        onClose={() => setIsAddTaskOpen(false)}
        onSuccess={reloadTasks}
        projectId={project.id}
        issues={issues ?? []}
      />
      <AddIssueModal
        isOpen={isAddIssueOpen}
        onClose={() => setIsAddIssueOpen(false)}
        onSuccess={reloadIssues}
        projectId={project.id}
      />
    </div>
  );
}
