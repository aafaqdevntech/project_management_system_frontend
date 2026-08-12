import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { ProtectedRoute } from '@/routes/ProtectedRoute';
import { LoginPage } from '@/pages/LoginPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { PeopleListPage } from '@/pages/PeopleListPage';
import { PeopleDetailPage } from '@/pages/PeopleDetailPage';
import { TeamsListPage } from '@/pages/TeamsListPage';
import { TeamDetailPage } from '@/pages/TeamDetailPage';
import { ProjectsListPage } from '@/pages/ProjectsListPage';
import { ProjectDetailPage } from '@/pages/ProjectDetailPage';
import { UnauthorizedPage } from '@/pages/UnauthorizedPage';
import { NotFoundPage } from '@/pages/NotFoundPage';

/**
 * Central route tree. New feature pages are added as nested <Route>s under
 * the protected <AppLayout> branch; wrap a subset of routes with
 * <RoleGuard allowedRoles={[...]} /> when only some roles may access them.
 */
export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/people" element={<PeopleListPage />} />
            <Route path="/people/:id" element={<PeopleDetailPage />} />
            <Route path="/teams" element={<TeamsListPage />} />
            <Route path="/teams/:id" element={<TeamDetailPage />} />
            <Route path="/projects" element={<ProjectsListPage />} />
            <Route path="/projects/:id" element={<ProjectDetailPage />} />
          </Route>
        </Route>

        <Route path="/unauthorized" element={<UnauthorizedPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}
