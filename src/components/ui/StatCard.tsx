import type { LucideIcon } from 'lucide-react';
import { formatCompactNumber } from '@/lib/formatNumber';

interface StatCardProps {
  label: string;
  /** Undefined while the count is still loading. */
  value?: number;
  icon: LucideIcon;
}

/**
 * KPI stat tile: icon + label + value. The value uses the font's default
 * proportional figures (not tabular-nums) per the dataviz stat-tile spec —
 * tabular-nums is reserved for columns of aligned numbers, not a standalone
 * display value.
 */
export function StatCard({ label, value, icon: Icon }: StatCardProps) {
  return (
    <div className="rounded-lg border border-border bg-white p-4">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary-600">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </div>
        <div className="min-w-0">
          <p className="text-sm text-slate-500">{label}</p>
          {value === undefined ? (
            <div className="mt-1 h-7 w-10 animate-pulse rounded bg-slate-200" />
          ) : (
            <p className="text-2xl font-semibold text-slate-900">
              {formatCompactNumber(value)}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
