import type { Job, Run } from '../providers/types';

const FINISHED_STATUSES = ['success', 'failed', 'canceled', 'skipped'];

export function formatDuration(totalSeconds: number) {
  const seconds = Math.max(0, Math.round(totalSeconds));
  if (seconds >= 3600) return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
  return `${Math.floor(seconds / 60)}m ${String(seconds % 60).padStart(2, '0')}s`;
}

export function formatRelativeTime(isoDate: string) {
  const seconds = (Date.now() - Date.parse(isoDate)) / 1000;
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 172800) return 'yesterday';
  return `${Math.floor(seconds / 86400)}d ago`;
}

export function formatJobDuration(job: Job, now: number) {
  if (job.status === 'running' && job.startedAt) return formatDuration((now - Date.parse(job.startedAt)) / 1000);
  return job.durationSeconds === null ? '—' : formatDuration(job.durationSeconds);
}

export function formatPipelineElapsed(run: Run, now: number) {
  if (run.durationSeconds !== null) return formatDuration(run.durationSeconds);
  const start = Date.parse(run.startedAt ?? run.createdAt);
  const end = run.finishedAt ? Date.parse(run.finishedAt) : now;
  return formatDuration((end - start) / 1000);
}

export function formatPipelineDuration(createdAt: string, updatedAt: string, status: string) {
  if (!FINISHED_STATUSES.includes(status)) return '—';
  return formatDuration((Date.parse(updatedAt) - Date.parse(createdAt)) / 1000);
}
