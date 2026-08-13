import { useEffect, useState } from 'react';
import { getAllTasks } from '@/services/taskService';
import { getAllIssues } from '@/services/issueService';
import { getProjects } from '@/services/projectService';
import { DashboardSection } from '@/features/dashboard/DashboardSection';
import { taskColumns, issueColumns, projectColumns } from '@/features/dashboard/dashboardColumns';
import type { Task } from '@/types/tasks';
import type { Issue } from '@/types/issues';
import type { Project } from '@/types/projects';

const ROW_LIMIT = 7;

/** Team-lead-only dashboard preview: their tasks needing attention, open issues, and all their team's projects — all client-side filtered/sorted/capped, since none of these endpoints support that server-side. */
export function TeamLeadOverview({ role }: { role: string }) {
  const [tasks, setTasks] = useState<Task[]>();
  const [isTasksLoading, setIsTasksLoading] = useState(true);
  const [isTasksError, setIsTasksError] = useState(false);
  const [tasksReloadKey, setTasksReloadKey] = useState(0);

  const [issues, setIssues] = useState<Issue[]>();
  const [isIssuesLoading, setIsIssuesLoading] = useState(true);
  const [isIssuesError, setIsIssuesError] = useState(false);
  const [issuesReloadKey, setIssuesReloadKey] = useState(0);

  const [projects, setProjects] = useState<Project[]>();
  const [isProjectsLoading, setIsProjectsLoading] = useState(true);
  const [isProjectsError, setIsProjectsError] = useState(false);
  const [projectsReloadKey, setProjectsReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setIsTasksLoading(true);
    setIsTasksError(false);

    getAllTasks()
      .then((data) => {
        if (!cancelled) setTasks(data);
      })
      .catch(() => {
        if (!cancelled) setIsTasksError(true);
      })
      .finally(() => {
        if (!cancelled) setIsTasksLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [tasksReloadKey]);

  useEffect(() => {
    let cancelled = false;
    setIsIssuesLoading(true);
    setIsIssuesError(false);

    getAllIssues()
      .then((data) => {
        if (!cancelled) setIssues(data);
      })
      .catch(() => {
        if (!cancelled) setIsIssuesError(true);
      })
      .finally(() => {
        if (!cancelled) setIsIssuesLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [issuesReloadKey]);

  useEffect(() => {
    let cancelled = false;
    setIsProjectsLoading(true);
    setIsProjectsError(false);

    getProjects()
      .then((data) => {
        if (!cancelled) setProjects(data);
      })
      .catch(() => {
        if (!cancelled) setIsProjectsError(true);
      })
      .finally(() => {
        if (!cancelled) setIsProjectsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [projectsReloadKey]);

  // Tasks needing attention, soonest due date first — undated tasks sort last.
  // const attentionTasks = (tasks ?? [])
  //   .filter((task) => task.status === 'unassigned' || task.status === 'ready_for_review')
  //   .sort((a, b) => {
  //     if (!a.due_date) return 1;
  //     if (!b.due_date) return -1;
  //     return a.due_date.localeCompare(b.due_date);
  //   })
  //   .slice(0, ROW_LIMIT);
  const statuses =
    role === 'team_lead'
      ? ['unassigned', 'ready_for_review']
      : ['assigned', 'returned', 'working', 'completed'];

  const attentionTasks = (tasks ?? [])
    .filter((task) => statuses.includes(task.status))
    .sort(
      (a, b) =>
        statuses.indexOf(a.status) - statuses.indexOf(b.status)
    );
  // Open issues, newest first.
  const openIssues = (issues ?? [])
    .filter((issue) => issue.status === 'open')
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
    .slice(0, ROW_LIMIT);

  // All projects (any status), soonest deadline first — undated projects sort last.
  const allProjects = (projects ?? [])
    .slice()
    .sort((a, b) => {
      if (!a.end_date) return 1;
      if (!b.end_date) return -1;
      return a.end_date.localeCompare(b.end_date);
    })
    .slice(0, ROW_LIMIT);

  return (
    <div className="mt-6 space-y-6">
      <DashboardSection
        title="Tasks needing attention"
        isLoading={isTasksLoading}
        isError={isTasksError}
        onRetry={() => setTasksReloadKey((key) => key + 1)}
        columns={taskColumns}
        data={attentionTasks}
        rowKey={(row) => row.id}
        emptyMessage="No unassigned or ready-for-review tasks."
      />
      <DashboardSection
        title="Open issues"
        isLoading={isIssuesLoading}
        isError={isIssuesError}
        onRetry={() => setIssuesReloadKey((key) => key + 1)}
        columns={issueColumns}
        data={openIssues}
        rowKey={(row) => row.id}
        emptyMessage="No open issues."
      />
      <DashboardSection
        title="Projects"
        isLoading={isProjectsLoading}
        isError={isProjectsError}
        onRetry={() => setProjectsReloadKey((key) => key + 1)}
        columns={projectColumns}
        data={allProjects}
        rowKey={(row) => row.id}
        emptyMessage="No projects yet."
      />
    </div>
  );
}
