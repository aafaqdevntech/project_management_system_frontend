import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useAppSelector } from '@/app/hooks';
import { getProjectTasks, getTeammates } from '@/services/taskService';
import { getProject } from '@/services/projectService';
import { getTeam } from '@/services/teamService';
import { AssignTaskModal } from '@/features/projects/AssignTaskModal';
import { ChangeTaskStatusModal } from '@/features/projects/ChangeTaskStatusModal';
import { formatDateSafe } from '@/lib/formatDate';
import { TASK_PRIORITY_BADGE_VARIANT } from '@/lib/taskPriority';
import { TASK_STATUS_LABELS } from '@/lib/taskStatus';
import type { Project } from '@/types/projects';
import type { Team } from '@/types/teams';
import type { Task } from '@/types/tasks';
import type { Teammate } from '@/types/teammates';
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

export function TaskDetailPage() {
  const { projectId: projectIdParam, taskId: taskIdParam } = useParams();
  const projectId = Number(projectIdParam);
  const taskId = Number(taskIdParam);
  const isValidId =
    projectIdParam !== undefined &&
    !Number.isNaN(projectId) &&
    taskIdParam !== undefined &&
    !Number.isNaN(taskId);

  const currentUser = useAppSelector((state) => state.auth.user);

  const [task, setTask] = useState<Task>();
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const reload = () => setReloadKey((key) => key + 1);

  const [project, setProject] = useState<Project>();
  const [team, setTeam] = useState<Team | null>(null);
  const [teammates, setTeammates] = useState<Teammate[]>([]);
  const [isAssignOpen, setIsAssignOpen] = useState(false);

  const isProjectTeamLead = Boolean(team && currentUser && team.team_lead_id === currentUser.id);
  const isTaskAssignee = Boolean(currentUser && task && task.assigned_to_id === currentUser.id);
  const canChangeStatus = task?.status !== 'unassigned' && (isProjectTeamLead || isTaskAssignee);

  // Primary: the task itself. There's no GET /tasks/{id}, so it's found by
  // id within the project's task list — this is what drives loading/error.
  useEffect(() => {
    if (!isValidId) return;

    let cancelled = false;
    setIsLoading(true);
    setIsError(false);

    getProjectTasks(projectId)
      .then((tasks) => {
        if (cancelled) return;
        const found = tasks.find((t) => t.id === taskId);
        if (found) setTask(found);
        else setIsError(true);
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
  }, [isValidId, projectId, taskId, reloadKey]);

  // Secondary/best-effort: project + team, only needed to gate the
  // team-lead-only "Assign" button — must never hide the task itself.
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

  useEffect(() => {
    if (!isProjectTeamLead) return;
    let cancelled = false;

    getTeammates()
      .then((data) => {
        if (!cancelled) setTeammates(data);
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [isProjectTeamLead]);

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
        <p className="text-sm text-slate-500">Invalid task id.</p>
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

  if (isError || !task) {
    return (
      <div>
        {backLink}
        <div className="flex items-center justify-between rounded-lg border border-border bg-white px-4 py-3 text-sm text-slate-600">
          <span>Couldn't load this task.</span>
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
          <h1 className="text-base font-semibold text-slate-900">{task.title}</h1>
          <Badge variant={TASK_PRIORITY_BADGE_VARIANT[task.priority]}>{task.priority}</Badge>
        </div>

        <div className="mt-4 divide-y divide-border">
          <DetailRow label="Description" value={task.description} />
          <DetailRow label="Status" value={TASK_STATUS_LABELS[task.status]} />
          <DetailRow label="Due date" value={formatDateSafe(task.due_date, 'MMMM d, yyyy')} />
          <DetailRow label="Assigned to" value={task.assigned_to_name} />
          <DetailRow label="Created by" value={task.created_by_name} />
          <DetailRow label="Created" value={formatDateSafe(task.created_at, 'MMMM d, yyyy')} />
          <DetailRow label="Updated" value={formatDateSafe(task.updated_at, 'MMMM d, yyyy')} />
        </div>

        {isProjectTeamLead && task.status === 'unassigned' ? (
          <div className="mt-6 border-t border-border pt-6">
            <Button size="sm" onClick={() => setIsAssignOpen(true)}>
              Assign
            </Button>
          </div>
        ) : null}
        {canChangeStatus ? (
          <div className="mt-6 border-t border-border pt-6">
            <Button size="sm" onClick={() => setIsStatusOpen(true)}>
              Change status
            </Button>
          </div>
        ) : null}
      </div>

      <AssignTaskModal
        isOpen={isAssignOpen}
        onClose={() => setIsAssignOpen(false)}
        onSuccess={reload}
        taskId={task.id}
        teammates={teammates}
      />
      <ChangeTaskStatusModal
        onOpen={isStatusOpen}
        onClose={() => setIsStatusOpen(false)}
        onSuccess={reload}
        taskId={task.id}
        isTeamLead={isProjectTeamLead}
      />
    </div>
  );
}
