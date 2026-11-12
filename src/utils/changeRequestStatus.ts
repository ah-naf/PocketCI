import type { Approval, ChangeRequestState } from '../providers/types';

type Badge = { status: string; label: string };

export function stateBadge(state: ChangeRequestState, draft: boolean): Badge {
  if (state === 'merged') return { status: 'success', label: 'Merged' };
  if (state === 'closed') return { status: 'failed', label: 'Closed' };
  return draft ? { status: 'canceled', label: 'Draft' } : { status: 'pending', label: 'Open' };
}

export function approvalBadge({ approved, changesRequestedBy }: Approval): Badge {
  if (changesRequestedBy.length > 0) return { status: 'failed', label: 'Changes requested' };
  return approved ? { status: 'success', label: 'Approved' } : { status: 'pending', label: 'Not approved yet' };
}

export function approvalSummary({ approvedBy, changesRequestedBy }: Approval) {
  const parts = [
    approvedBy.length > 0 && `Approved by ${approvedBy.join(', ')}`,
    changesRequestedBy.length > 0 && `Changes requested by ${changesRequestedBy.join(', ')}`,
  ].filter(Boolean);
  return parts.length > 0 ? parts.join('. ') : 'Nobody has approved yet.';
}
