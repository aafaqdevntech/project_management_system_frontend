import { useAppSelector } from '@/app/hooks';
import { useGetMyCountsQuery } from '@/features/dashboard/dashboardApi';
import { getStatTilesForRole, getStatTileValue } from '@/features/dashboard/statTiles';
import {
  getFirstName,
  getDashboardSubtitle,
  getBelowSectionNote,
} from '@/features/dashboard/greeting';
import { StatCard } from '@/components/ui/StatCard';
import { Button } from '@/components/ui/Button';

export function DashboardPage() {
  const user = useAppSelector((state) => state.auth.user);
  const { data, isError, refetch } = useGetMyCountsQuery();

  // AuthBootstrap resolves `user`, and AppLayout only renders this page once
  // the user has a profile/employment_detail — these are just type-narrowing
  // guards, not expected runtime cases.
  if (!user) return null;
  if (!user.employment_detail) return null;

  const tiles = getStatTilesForRole(user.employment_detail.role);
  const belowSectionNote = getBelowSectionNote(user);

  return (
    <div>
      <div>
        <h1 className="text-xl font-semibold text-slate-900">
          Welcome back, {getFirstName(user)} 👋
        </h1>
        <p className="mt-1 text-sm text-slate-500">{getDashboardSubtitle(user)}</p>
      </div>

      <div className="mt-6">
        {isError ? (
          <div className="flex items-center justify-between rounded-lg border border-border bg-white px-4 py-3 text-sm text-slate-600">
            <span>Couldn't load your stats.</span>
            <Button variant="secondary" size="sm" onClick={() => refetch()}>
              Retry
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {tiles.map((tile) => (
              <StatCard
                key={tile.key}
                label={tile.label}
                icon={tile.icon}
                value={getStatTileValue(data, tile.key)}
              />
            ))}
          </div>
        )}
      </div>

      {belowSectionNote ? (
        <div className="mt-6 rounded-lg border border-dashed border-border p-4 text-sm text-slate-500">
          {belowSectionNote}
        </div>
      ) : null}
    </div>
  );
}
