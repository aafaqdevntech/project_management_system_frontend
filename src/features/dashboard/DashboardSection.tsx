import { Button } from '@/components/ui/Button';
import { Table, type Column } from '@/components/ui/Table';

interface DashboardSectionProps<T> {
  title: string;
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
  columns: Column<T>[];
  data: T[];
  rowKey: (row: T) => number;
  emptyMessage: string;
}

/** Titled panel + loading-skeleton + error-retry + Table shell shared by the dashboard overview widgets (AdminOverview, TeamLeadOverview). */
export function DashboardSection<T>({
  title,
  isLoading,
  isError,
  onRetry,
  columns,
  data,
  rowKey,
  emptyMessage,
}: DashboardSectionProps<T>) {
  return (
    <div className="rounded-lg border border-border bg-white p-6">
      <h2 className="text-base font-semibold text-slate-900">{title}</h2>
      <div className="mt-4">
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="h-10 animate-pulse rounded bg-slate-200" />
            ))}
          </div>
        ) : isError ? (
          <div className="flex items-center justify-between rounded-lg border border-border px-4 py-3 text-sm text-slate-600">
            <span>Couldn't load this.</span>
            <Button variant="secondary" size="sm" onClick={onRetry}>
              Retry
            </Button>
          </div>
        ) : (
          <Table columns={columns} data={data} rowKey={rowKey} emptyMessage={emptyMessage} />
        )}
      </div>
    </div>
  );
}
