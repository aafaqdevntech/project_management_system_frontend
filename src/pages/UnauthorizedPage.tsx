import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';

export function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-surface-subtle px-4 text-center">
      <h1 className="text-3xl font-semibold text-slate-900">403</h1>
      <p className="text-sm text-slate-500">
        You don't have permission to access this page.
      </p>
      <Link to="/">
        <Button variant="secondary">Back to dashboard</Button>
      </Link>
    </div>
  );
}
