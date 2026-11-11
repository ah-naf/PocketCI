const ACTIVE_PIPELINE_STATUSES = ['created', 'pending', 'running', 'waiting_for_resource', 'canceling'];
const ACTIVE_JOB_STATUSES = ['running', 'pending', 'canceling'];

export function isPipelineActive(status: string) {
  return ACTIVE_PIPELINE_STATUSES.includes(status);
}

export function isJobActive(status: string) {
  return ACTIVE_JOB_STATUSES.includes(status);
}
