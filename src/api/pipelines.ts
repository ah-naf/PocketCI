import { buildQuery, getJson, getPage } from './gitlabClient';

export type PipelineSummary = {
  id: number;
  status: string;
  created_at: string;
  updated_at: string;
  web_url: string;
};

export type Pipeline = {
  id: number;
  status: string;
  ref: string;
  sha: string;
  web_url: string;
  created_at: string;
  started_at: string | null;
  finished_at: string | null;
  duration: number | null;
};

export type Job = {
  id: number;
  name: string;
  stage: string;
  status: string;
  duration: number | null;
  started_at: string | null;
  web_url: string;
};

export type CreatedPipeline = { id: number; status: string; web_url: string };

export function fetchPipelines(projectId: number, branch: string, status: string | undefined, page: number) {
  const query = buildQuery({ ref: branch, status, per_page: 20, order_by: 'id', sort: 'desc', page });
  return getPage<PipelineSummary>(`/projects/${projectId}/pipelines${query}`);
}

export function fetchPipeline(projectId: number, pipelineId: number) {
  return getJson<Pipeline>(`/projects/${projectId}/pipelines/${pipelineId}`);
}

export function fetchJobs(projectId: number, pipelineId: number) {
  const query = buildQuery({ per_page: 100 });
  return getJson<Job[]>(`/projects/${projectId}/pipelines/${pipelineId}/jobs${query}`);
}

export function fetchJob(projectId: number, jobId: number) {
  return getJson<Job>(`/projects/${projectId}/jobs/${jobId}`);
}

export function cancelPipeline(projectId: number, pipelineId: number) {
  return getJson<Pipeline>(`/projects/${projectId}/pipelines/${pipelineId}/cancel`, { method: 'POST' });
}

export function retryPipeline(projectId: number, pipelineId: number) {
  return getJson<Pipeline>(`/projects/${projectId}/pipelines/${pipelineId}/retry`, { method: 'POST' });
}

export function retryJob(projectId: number, jobId: number) {
  return getJson<Job>(`/projects/${projectId}/jobs/${jobId}/retry`, { method: 'POST' });
}

export function playJob(projectId: number, jobId: number) {
  return getJson<Job>(`/projects/${projectId}/jobs/${jobId}/play`, { method: 'POST' });
}

export function cancelJob(projectId: number, jobId: number) {
  return getJson<Job>(`/projects/${projectId}/jobs/${jobId}/cancel`, { method: 'POST' });
}

export function createPipeline(projectId: number, branch: string, variables: { key: string; value: string }[]) {
  return getJson<CreatedPipeline>(`/projects/${projectId}/pipeline`, {
    method: 'POST',
    body: {
      ref: branch,
      variables: variables.map(({ key, value }) => ({ key, value, variable_type: 'env_var' })),
    },
  });
}
