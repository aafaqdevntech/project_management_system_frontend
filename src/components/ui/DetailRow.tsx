interface DetailRowProps {
  label: string;
  value: string | null;
}

/** Label/value row used in read-only detail views (ProfileModal, People detail page). */
export function DetailRow({ label, value }: DetailRowProps) {
  return (
    <div className="flex items-center justify-between py-2 text-sm">
      <span className="text-slate-500">{label}</span>
      <span className="font-medium text-slate-900">{value ?? '—'}</span>
    </div>
  );
}
