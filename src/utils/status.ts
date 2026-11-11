const ACTIVE_PIPELINE_STATUSES = ['created', 'pending', 'running', 'waiting_for_resource'];
const ACTIVE_JOB_STATUSES = ['running', 'pending'];

export function isPipelineActive(status: string) {
  return ACTIVE_PIPELINE_STATUSES.includes(status);
}

export function isJobActive(status: string) {
  return ACTIVE_JOB_STATUSES.includes(status);
}
