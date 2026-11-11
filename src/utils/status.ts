import type { RunFilter } from '../providers/types';

const ACTIVE_PIPELINE_STATUSES = ['created', 'pending', 'running', 'waiting_for_resource', 'canceling'];
const ACTIVE_JOB_STATUSES = ['running', 'pending', 'canceling'];

export function isPipelineActive(status: string) {
  return ACTIVE_PIPELINE_STATUSES.includes(status);
}

export function isJobActive(status: string) {
  return ACTIVE_JOB_STATUSES.includes(status);
}

export const RUN_FILTERS: { id: RunFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'running', label: 'Running' },
  { id: 'failed', label: 'Failed' },
  { id: 'success', label: 'Passed' },
  { id: 'canceled', label: 'Canceled' },
];
