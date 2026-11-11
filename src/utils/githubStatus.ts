import type { RunStatus } from '../providers/types';

export function mapGithubStatus(status: string, conclusion: string | null): RunStatus {
  if (status === 'in_progress') return 'running';
  if (['queued', 'waiting', 'requested', 'pending'].includes(status)) return 'pending';
  if (status !== 'completed') return status;
  switch (conclusion) {
    case 'success':
    case 'neutral':
      return 'success';
    case 'failure':
    case 'timed_out':
    case 'startup_failure':
      return 'failed';
    case 'cancelled':
      return 'canceled';
    case 'skipped':
      return 'skipped';
    case 'action_required':
      return 'manual';
    default:
      return conclusion ?? 'pending';
  }
}
