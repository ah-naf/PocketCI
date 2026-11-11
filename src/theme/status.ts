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
};

export function getStatusStyle(status: string): StatusStyle {
  return statusStyles[status] ?? { color: 'pending', label: status, glyph: '…' };
}
