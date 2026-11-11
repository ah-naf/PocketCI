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

export function formatPipelineDuration(createdAt: string, updatedAt: string, status: string) {
  if (!FINISHED_STATUSES.includes(status)) return '—';
  return formatDuration((Date.parse(updatedAt) - Date.parse(createdAt)) / 1000);
}
