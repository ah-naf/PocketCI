import type { Job } from '../api/pipelines';

export type Stage = { name: string; jobs: Job[] };

const FINISHED_JOB_STATUSES = ['success', 'failed', 'canceled', 'skipped'];

export function groupJobsByStage(jobs: Job[]): Stage[] {
  const stages = new Map<string, Job[]>();
  for (const job of [...jobs].sort((a, b) => a.id - b.id)) {
    stages.set(job.stage, [...(stages.get(job.stage) ?? []), job]);
  }
  return [...stages].map(([name, stageJobs]) => ({ name, jobs: stageJobs }));
}

export function getStageStatus(jobs: Job[]) {
  if (jobs.some((job) => job.status === 'failed')) return 'failed';
  if (jobs.some((job) => job.status === 'running')) return 'running';
  if (jobs.every((job) => job.status === 'success')) return 'success';
  return 'pending';
}

export function countFinishedJobs(jobs: Job[]) {
  return jobs.filter((job) => FINISHED_JOB_STATUSES.includes(job.status)).length;
}
