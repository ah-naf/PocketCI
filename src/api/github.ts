import { buildQuery } from './http';
import { githubGetJson, githubGetPage } from './githubClient';
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
};

export type GithubJob = {
  id: number;
  name: string;
  status: string;
  conclusion: string | null;
  started_at: string | null;
  completed_at: string | null;
  html_url: string;
};

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

export async function fetchRuns(fullName: string, branch: string) {
  const query = buildQuery({ branch, per_page: 20 });
  return (await githubGetJson<{ workflow_runs: GithubRun[] }>(`/repos/${fullName}/actions/runs${query}`)).workflow_runs;
}

export function fetchRun(fullName: string, runId: string) {
  return githubGetJson<GithubRun>(`/repos/${fullName}/actions/runs/${runId}`);
}

export async function fetchRunJobs(fullName: string, runId: string) {
  const query = buildQuery({ per_page: 100 });
  return (await githubGetJson<{ jobs: GithubJob[] }>(`/repos/${fullName}/actions/runs/${runId}/jobs${query}`)).jobs;
}

export function fetchRunJob(fullName: string, jobId: string) {
  return githubGetJson<GithubJob>(`/repos/${fullName}/actions/jobs/${jobId}`);
}
