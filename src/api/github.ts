import { ApiError } from './errors';
import { buildQuery } from './http';
import { githubGetJson, githubGetPage, githubRequest } from './githubClient';
import type { Page } from '../providers/types';

export type GithubRepo = { name: string; full_name: string; default_branch: string };
export type GithubBranch = { name: string };

export type GithubRun = {
  id: number;
  name: string | null;
  status: string;
  conclusion: string | null;
  head_branch: string | null;
  head_sha: string;
  html_url: string;
  created_at: string;
  run_started_at?: string;
  updated_at: string;
  event: string;
  actor?: { login: string; avatar_url?: string | null } | null;
  head_commit?: { message: string } | null;
};

export type GithubJob = {
  id: number;
  name: string;
  status: string;
  conclusion: string | null;
  started_at: string | null;
  completed_at: string | null;
  runner_name: string | null;
  html_url: string;
};

export type GithubArtifact = { id: number; name: string; size_in_bytes: number; expired: boolean };

export type GithubContent = { name: string; path: string; type: string };

const MAX_FILTER_PAGES = 5;

async function fetchFiltered<T>(
  path: string,
  params: Record<string, string>,
  page: number,
  query: string,
  textOf: (item: T) => string,
): Promise<Page<T>> {
  const load = (pageNumber: number) =>
    githubGetPage<T>(`${path}${buildQuery({ ...params, per_page: 100, page: pageNumber })}`);
  if (query === '') return load(page);
  if (page > 1) return { items: [], nextPage: null };

  const needle = query.toLowerCase();
  const items: T[] = [];
  let next: number | null = 1;
  // shortcut: GitHub has no search for these lists, so only the first 500 items are filtered, raise MAX_FILTER_PAGES if needed.
  for (let loaded = 0; next !== null && loaded < MAX_FILTER_PAGES; loaded += 1) {
    const result: Page<T> = await load(next);
    items.push(...result.items.filter((item) => textOf(item).toLowerCase().includes(needle)));
    next = result.nextPage;
  }
  return { items, nextPage: null };
}

export function fetchRepos(query: string, page: number) {
  return fetchFiltered<GithubRepo>(
    '/user/repos',
    { sort: 'pushed', affiliation: 'owner,collaborator,organization_member' },
    page,
    query,
    (repo) => repo.full_name,
  );
}

export function fetchRepo(fullName: string) {
  return githubGetJson<GithubRepo>(`/repos/${fullName}`);
}

export function fetchRepoBranches(fullName: string, query: string, page: number) {
  return fetchFiltered<GithubBranch>(`/repos/${fullName}/branches`, {}, page, query, (branch) => branch.name);
}

export function fetchRuns(fullName: string, branch: string | undefined, status: string | undefined, page: number) {
  const query = buildQuery({ branch, status, per_page: 20, page });
  return githubGetPage<GithubRun, { workflow_runs: GithubRun[] }>(
    `/repos/${fullName}/actions/runs${query}`,
    (body) => body.workflow_runs,
  );
}

export function fetchRun(fullName: string, runId: string) {
  return githubGetJson<GithubRun>(`/repos/${fullName}/actions/runs/${runId}`);
}

export async function fetchRunJobs(fullName: string, runId: string) {
  const query = buildQuery({ per_page: 100 });
  return (await githubGetJson<{ jobs: GithubJob[] }>(`/repos/${fullName}/actions/runs/${runId}/jobs${query}`)).jobs;
}

export async function fetchRunArtifacts(fullName: string, runId: string) {
  const query = buildQuery({ per_page: 100 });
  const path = `/repos/${fullName}/actions/runs/${runId}/artifacts${query}`;
  return (await githubGetJson<{ artifacts: GithubArtifact[] }>(path)).artifacts;
}

export function fetchRunJob(fullName: string, jobId: string) {
  return githubGetJson<GithubJob>(`/repos/${fullName}/actions/jobs/${jobId}`);
}

export async function fetchWorkflowFiles(fullName: string, branch: string) {
  try {
    const query = buildQuery({ ref: branch });
    const files = await githubGetJson<GithubContent[]>(`/repos/${fullName}/contents/.github/workflows${query}`);
    return files.filter((file) => file.type === 'file' && /\.ya?ml$/.test(file.name));
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return [];
    throw error;
  }
}

export async function fetchFileText(fullName: string, path: string, branch: string) {
  const encodedPath = path.split('/').map(encodeURIComponent).join('/');
  const { text } = await githubRequest(`/repos/${fullName}/contents/${encodedPath}${buildQuery({ ref: branch })}`, {
    headers: { Accept: 'application/vnd.github.raw+json' },
  });
  return text;
}

export async function dispatchWorkflow(fullName: string, workflowFile: string, body: object) {
  const { text } = await githubRequest(
    `/repos/${fullName}/actions/workflows/${encodeURIComponent(workflowFile)}/dispatches`,
    { method: 'POST', body },
  );
  return text ? (JSON.parse(text) as { workflow_run_id?: number }).workflow_run_id : undefined;
}

export async function fetchWorkflowRuns(fullName: string, workflowFile: string, branch: string) {
  const query = buildQuery({ event: 'workflow_dispatch', branch, per_page: 5 });
  const path = `/repos/${fullName}/actions/workflows/${encodeURIComponent(workflowFile)}/runs${query}`;
  return (await githubGetJson<{ workflow_runs: GithubRun[] }>(path)).workflow_runs;
}

export async function forceCancelWorkflowRun(fullName: string, runId: string) {
  await githubRequest(`/repos/${fullName}/actions/runs/${runId}/force-cancel`, { method: 'POST' });
}

export async function rerunRun(fullName: string, runId: string) {
  await githubRequest(`/repos/${fullName}/actions/runs/${runId}/rerun`, { method: 'POST' });
}

export async function rerunFailedJobs(fullName: string, runId: string) {
  await githubRequest(`/repos/${fullName}/actions/runs/${runId}/rerun-failed-jobs`, { method: 'POST' });
}

export async function rerunJob(fullName: string, jobId: string) {
  await githubRequest(`/repos/${fullName}/actions/jobs/${jobId}/rerun`, { method: 'POST' });
}

export async function cancelWorkflowRun(fullName: string, runId: string) {
  await githubRequest(`/repos/${fullName}/actions/runs/${runId}/cancel`, { method: 'POST' });
}
