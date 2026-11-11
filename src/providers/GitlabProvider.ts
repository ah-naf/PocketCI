import { fetchCiVariables } from '../api/ciVariables';
import {
  cancelJob,
  cancelPipeline,
  createPipeline,
  fetchJob,
  fetchJobs,
  fetchPipeline,
  fetchPipelineVariables,
  fetchPipelines,
  playJob,
  retryJob,
  retryPipeline,
  type Job as GitlabJob,
  type Pipeline,
} from '../api/pipelines';
import { fetchBranches, fetchProject, fetchProjects, type Project } from '../api/projects';
import { fetchTrace } from '../api/trace';
import { fetchCurrentUser } from '../api/user';
import { DEFAULT_BASE_URL } from '../storage/secure';
import { parseLog } from '../utils/log';
import { CiProvider } from './CiProvider';
import type { Job, Notice, ProjectRef, Run, RunFilter, RunOptions, StartRunRequest } from './types';

const GITLAB_STATUS: Record<RunFilter, string | undefined> = {
  all: undefined,
  running: 'running',
  failed: 'failed',
  success: 'success',
  canceled: 'canceled',
};

const toProjectRef = (project: Project): ProjectRef => ({
  providerId: 'gitlab',
  key: String(project.id),
  name: project.name,
  path: project.path_with_namespace,
});

const toRun = (pipeline: Pipeline): Run => ({
  id: String(pipeline.id),
  status: pipeline.status,
  ref: pipeline.ref,
  sha: pipeline.sha,
  webUrl: pipeline.web_url,
  createdAt: pipeline.created_at,
  startedAt: pipeline.started_at,
  finishedAt: pipeline.finished_at,
  durationSeconds: pipeline.duration,
  triggeredBy: pipeline.user ? pipeline.user.name || pipeline.user.username : null,
  source: pipeline.source,
  commitTitle: null,
});

const toJob = (job: GitlabJob): Job => ({
  id: String(job.id),
  name: job.name,
  group: job.stage,
  status: job.status,
  durationSeconds: job.duration,
  startedAt: job.started_at,
  finishedAt: job.finished_at,
  runnerName: job.runner?.description ?? null,
  webUrl: job.web_url,
});

const FALLBACK_NOTICE: Notice = {
  kind: 'info',
  title: 'include: files not resolved',
  message:
    "The config pulls in files this app couldn't read, so declared variables aren't listed. You can still run the pipeline and add variables by hand.",
};

export class GitlabProvider extends CiProvider {
  readonly id = 'gitlab';
  readonly displayName = 'GitLab';
  readonly labels = {
    projects: 'Projects',
    project: 'project',
    run: 'pipeline',
    runs: 'pipelines',
    target: 'pipeline',
  };
  readonly capabilities = { cancelJob: true, liveLogs: true, forceCancelRun: false, playJob: true, runVariables: true };
  readonly setup = {
    editableBaseUrl: true,
    defaultBaseUrl: DEFAULT_BASE_URL,
    tokenHint: 'The token needs the api scope. Create one in GitLab under Preferences → Access tokens.',
  };

  async verifyCredentials(credentials: { baseUrl: string; token: string }) {
    return (await fetchCurrentUser(credentials)).username;
  }

  async listProjects(query: string, page: number) {
    const result = await fetchProjects(query, page);
    return { ...result, items: result.items.map(toProjectRef) };
  }

  async getDefaultBranch(project: ProjectRef) {
    return (await fetchProject(project.key)).default_branch;
  }

  async listBranches(project: ProjectRef, query: string, page: number) {
    const result = await fetchBranches(Number(project.key), query, page);
    return { ...result, items: result.items.map((branch) => branch.name) };
  }

  async getRunOptions(project: ProjectRef, branch: string): Promise<RunOptions> {
    const { variables, lintErrors, usedFallback } = await fetchCiVariables(Number(project.key), branch);
    const notices: Notice[] = [];
    if (lintErrors.length > 0) {
      notices.push({
        kind: 'error',
        title: "CI config didn't pass lint",
        message: 'Fix .gitlab-ci.yml on this branch, then pull to refresh.',
        detail: lintErrors.join('\n'),
      });
    }
    if (usedFallback) notices.push(FALLBACK_NOTICE);
    const inputs = variables.map(({ key, value, options, description }) => ({
      key,
      label: description,
      defaultValue: value,
      options,
    }));
    return {
      targets: [{ id: 'pipeline', name: 'Pipeline', runnable: true, inputs }],
      allowCustomInputs: true,
      notices,
    };
  }

  async startRun(project: ProjectRef, branch: string, request: StartRunRequest) {
    const created = await createPipeline(Number(project.key), branch, request.inputs);
    return { runId: String(created.id) };
  }

  async listRuns(project: ProjectRef, branch: string | null, filter: RunFilter, page: number) {
    const result = await fetchPipelines(Number(project.key), branch ?? undefined, GITLAB_STATUS[filter], page);
    return {
      ...result,
      items: result.items.map(({ id, ref, source, status, created_at, updated_at }) => ({
        id: String(id),
        title: '',
        ref,
        source,
        status,
        createdAt: created_at,
        updatedAt: updated_at,
      })),
    };
  }

  async getRun(project: ProjectRef, runId: string) {
    return toRun(await fetchPipeline(Number(project.key), Number(runId)));
  }

  async listJobs(project: ProjectRef, runId: string) {
    return (await fetchJobs(Number(project.key), Number(runId))).map(toJob);
  }

  async getRunVariables(project: ProjectRef, runId: string) {
    return fetchPipelineVariables(Number(project.key), Number(runId));
  }

  async getJob(project: ProjectRef, jobId: string) {
    return toJob(await fetchJob(Number(project.key), Number(jobId)));
  }

  async readLog(project: ProjectRef, jobId: string, cursor: string | null) {
    const chunk = await fetchTrace(Number(project.key), Number(jobId), Number(cursor ?? 0));
    return { text: chunk.text, cursor: String(chunk.nextOffset), replace: chunk.replace };
  }

  cleanLog(raw: string) {
    return parseLog(raw);
  }

  async cancelRun(project: ProjectRef, runId: string) {
    await cancelPipeline(Number(project.key), Number(runId));
  }

  async retryRun(project: ProjectRef, runId: string) {
    await retryPipeline(Number(project.key), Number(runId));
  }

  async retryJob(project: ProjectRef, jobId: string) {
    await retryJob(Number(project.key), Number(jobId));
  }

  async playJob(project: ProjectRef, jobId: string) {
    await playJob(Number(project.key), Number(jobId));
  }

  async cancelJob(project: ProjectRef, jobId: string) {
    await cancelJob(Number(project.key), Number(jobId));
  }
}
