import { buildQuery, getJson } from './gitlabClient';

export type PipelineSummary = {
  id: number;
  status: string;
  created_at: string;
  updated_at: string;
  web_url: string;
};

export type CreatedPipeline = { id: number; status: string; web_url: string };

export function fetchPipelines(projectId: number, branch: string) {
  const query = buildQuery({ ref: branch, per_page: 20, order_by: 'id', sort: 'desc' });
  return getJson<PipelineSummary[]>(`/projects/${projectId}/pipelines${query}`);
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
