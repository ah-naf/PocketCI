import type { ColorName } from '.';

type StatusStyle = { color: ColorName; label: string; textColor?: ColorName };

const statusStyles: Record<string, StatusStyle> = {
  success: { color: 'success', label: 'Passed' },
  failed: { color: 'failed', label: 'Failed' },
  running: { color: 'running', label: 'Running' },
  pending: { color: 'pending', label: 'Pending' },
  created: { color: 'pending', label: 'Created' },
  waiting_for_resource: { color: 'pending', label: 'Waiting' },
  canceled: { color: 'canceled', label: 'Canceled', textColor: 'dim' },
  skipped: { color: 'canceled', label: 'Skipped', textColor: 'dim' },
  manual: { color: 'manual', label: 'Manual' },
};

export function getStatusStyle(status: string): StatusStyle {
  return statusStyles[status] ?? { color: 'pending', label: status };
}
