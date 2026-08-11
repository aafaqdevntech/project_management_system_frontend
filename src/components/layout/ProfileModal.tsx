import type { AuthUser } from '@/types/auth';
import { formatDateSafe } from '@/lib/formatDate';
import { Modal } from '@/components/ui/Modal';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { DetailRow } from '@/components/ui/DetailRow';
import { ROLE_LABELS } from '@/lib/roles';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: AuthUser;
}

/** Read-only view of the logged-in user's account, profile, and employment data. */
export function ProfileModal({ isOpen, onClose, user }: ProfileModalProps) {
  const { profile, employment_detail: employment } = user;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Profile">
      <div className="flex flex-col items-center text-center">
        <Avatar
          src={profile?.image_url ?? null}
          name={profile?.full_name ?? user.username}
          size="lg"
        />
        <h3 className="mt-3 text-base font-semibold text-slate-900">
          {profile?.full_name ?? user.username}
        </h3>
        <p className="text-sm text-slate-500">@{user.username}</p>
        <div className="mt-2">
          <Badge variant={employment ? 'primary' : 'neutral'}>
            {employment ? ROLE_LABELS[employment.role] : 'Not set'}
          </Badge>
        </div>
      </div>

      <div className="mt-6">
        <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-400">
          Contact
        </h4>
        <div className="mt-1 divide-y divide-border">
          <DetailRow label="Email" value={user.email} />
          <DetailRow label="Phone" value={profile?.phone ?? null} />
          <DetailRow label="Address" value={profile?.address ?? null} />
          <DetailRow label="City" value={profile?.city ?? null} />
          <DetailRow label="Country" value={profile?.country ?? null} />
        </div>
      </div>

      <div className="mt-6">
        <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-400">
          Employment
        </h4>
        <div className="mt-1 divide-y divide-border">
          <DetailRow label="Job position" value={employment?.job_position ?? null} />
          <DetailRow
            label="Team"
            value={employment?.team_id ? `Team #${employment.team_id}` : null}
          />
          <DetailRow
            label="Joined"
            value={employment ? formatDateSafe(employment.joined_at, 'MMMM d, yyyy') : null}
          />
        </div>
      </div>
    </Modal>
  );
}
