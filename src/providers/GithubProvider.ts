import {
  fetchRepo,
  fetchRepoBranches,
  fetchRepos,
  fetchRun,
  fetchRunJob,
  fetchRunJobs,
  fetchRuns,
  type GithubJob,
  type GithubRepo,
  type GithubRun,
} from '../api/github';
import { fetchGithubLogin, githubRequest } from '../api/githubClient';
import { ApiError } from '../api/errors';
import { cleanGithubLog } from '../utils/githubLog';
import { mapGithubStatus } from '../utils/githubStatus';
import { CiProvider } from './CiProvider';
import type { Credentials, Job, ProjectRef, Run, RunOptions } from './types';

const toProjectRef = (repo: GithubRepo): ProjectRef => ({
  providerId: 'github',
  key: repo.full_name,
  name: repo.name,
  path: repo.full_name,
});

const toRun = (run: GithubRun): Run => ({
  id: String(run.id),
  status: mapGithubStatus(run.status, run.conclusion),
  ref: run.head_branch ?? '',
  sha: run.head_sha,
  webUrl: run.html_url,
  createdAt: run.created_at,
  startedAt: run.run_started_at ?? null,
  finishedAt: run.status === 'completed' ? run.updated_at : null,
  durationSeconds: null,
});

const toJob = (job: GithubJob): Job => ({
  id: String(job.id),
  name: job.name,
  group: 'Jobs',
  status: mapGithubStatus(job.status, job.conclusion),
  durationSeconds:
    job.started_at && job.completed_at
      ? (Date.parse(job.completed_at) - Date.parse(job.started_at)) / 1000
      : null,
  startedAt: job.started_at,
  webUrl: job.html_url,
});

const RUN_OPTIONS_PENDING: RunOptions = {
  targets: [],
  allowCustomInputs: false,
  notices: [
    {
      kind: 'info',
      title: 'Starting workflows is not available yet',
      message: 'You can browse runs, jobs and logs. Running a workflow comes in a later step.',
    },
  ],
};

export class GithubProvider extends CiProvider {
  readonly id = 'github';
  readonly displayName = 'GitHub';
  readonly labels = {
    projects: 'Repositories',
    project: 'repository',
    run: 'workflow run',
    runs: 'workflow runs',
  };
  readonly capabilities = { cancelJob: false, liveLogs: false };
  readonly setup = {
    editableBaseUrl: false,
    defaultBaseUrl: 'https://api.github.com',
    tokenHint:
      'Use a classic token with the repo and workflow scopes. Create one in GitHub under Settings → Developer settings → Personal access tokens.',
  };

  verifyCredentials({ token }: Credentials) {
    return fetchGithubLogin(token);
  }

  async listProjects(query: string, page: number) {
    const result = await fetchRepos(query, page);
    return { ...result, items: result.items.map(toProjectRef) };
  }

  async getDefaultBranch(project: ProjectRef) {
    return (await fetchRepo(project.key)).default_branch;
  }

  async listBranches(project: ProjectRef, query: string, page: number) {
    const result = await fetchRepoBranches(project.key, query, page);
    return { ...result, items: result.items.map((branch) => branch.name) };
  }

  async getRunOptions() {
    return RUN_OPTIONS_PENDING;
  }

  startRun(): Promise<{ runId: string | null }> {
    return Promise.reject(new Error('Starting workflows is not available yet'));
  }

  async listRuns(project: ProjectRef, branch: string) {
    const runs = await fetchRuns(project.key, branch);
    return runs.map((run) => ({
      id: String(run.id),
      title: run.name ?? '',
      status: mapGithubStatus(run.status, run.conclusion),
      createdAt: run.created_at,
      updatedAt: run.updated_at,
    }));
  }

  async getRun(project: ProjectRef, runId: string) {
    return toRun(await fetchRun(project.key, runId));
  }

  async listJobs(project: ProjectRef, runId: string) {
    return (await fetchRunJobs(project.key, runId)).map(toJob);
  }

  async getJob(project: ProjectRef, jobId: string) {
    return toJob(await fetchRunJob(project.key, jobId));
  }

  async readLog(project: ProjectRef, jobId: string) {
    try {
      const { text } = await githubRequest(`/repos/${project.key}/actions/jobs/${jobId}/logs`);
      return { text, cursor: null, replace: true };
    } catch (error) {
      if (error instanceof ApiError && (error.status === 404 || error.status === 410)) {
        return { text: '', cursor: null, replace: true };
      }
      throw error;
    }
  }

  cleanLog(raw: string) {
    return cleanGithubLog(raw);
  }

  cancelRun(): Promise<void> {
    return Promise.reject(new Error('Cancelling is not available yet'));
  }
}
