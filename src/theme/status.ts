import type { ColorName } from '.';

type StatusStyle = { color: ColorName; label: string; glyph?: string; textColor?: ColorName };

const statusStyles: Record<string, StatusStyle> = {
  success: { color: 'success', label: 'Passed', glyph: '✓' },
  failed: { color: 'failed', label: 'Failed', glyph: '✕' },
  running: { color: 'running', label: 'Running' },
  pending: { color: 'pending', label: 'Pending', glyph: '…' },
  created: { color: 'pending', label: 'Created', glyph: '…' },
  waiting_for_resource: { color: 'pending', label: 'Waiting', glyph: '…' },
  canceled: { color: 'canceled', label: 'Canceled', glyph: '–', textColor: 'dim' },
  skipped: { color: 'canceled', label: 'Skipped', glyph: '–', textColor: 'dim' },
  manual: { color: 'manual', label: 'Manual', glyph: '▸' },
  canceling: { color: 'canceled', label: 'Canceling', glyph: '…', textColor: 'dim' },
  preparing: { color: 'pending', label: 'Preparing', glyph: '…' },
  scheduled: { color: 'pending', label: 'Scheduled', glyph: '…' },
};

export function getStatusStyle(status: string): StatusStyle {
  const label = status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, ' ');
  return statusStyles[status] ?? { color: 'pending', label, glyph: '…' };
}
