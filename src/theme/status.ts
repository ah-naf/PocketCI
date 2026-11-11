import type { IconName } from '../components/Icon';
import type { ColorName } from '.';

type StatusStyle = { color: ColorName; label: string; icon?: IconName; textColor?: ColorName };

const statusStyles: Record<string, StatusStyle> = {
  success: { color: 'success', label: 'Passed', icon: 'check' },
  failed: { color: 'failed', label: 'Failed', icon: 'close' },
  running: { color: 'running', label: 'Running' },
  pending: { color: 'pending', label: 'Pending', icon: 'dots' },
  created: { color: 'pending', label: 'Created', icon: 'dots' },
  waiting_for_resource: { color: 'pending', label: 'Waiting', icon: 'dots' },
  canceled: { color: 'canceled', label: 'Canceled', icon: 'minus', textColor: 'dim' },
  skipped: { color: 'canceled', label: 'Skipped', icon: 'minus', textColor: 'dim' },
  manual: { color: 'manual', label: 'Manual', icon: 'play' },
  canceling: { color: 'canceled', label: 'Canceling', icon: 'dots', textColor: 'dim' },
  preparing: { color: 'pending', label: 'Preparing', icon: 'dots' },
  scheduled: { color: 'pending', label: 'Scheduled', icon: 'dots' },
};

export function getStatusStyle(status: string): StatusStyle {
  const label = status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, ' ');
  return statusStyles[status] ?? { color: 'pending', label, icon: 'dots' };
}
