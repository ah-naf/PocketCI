import {
  cancelWorkflowRun,
  dispatchWorkflow,
  forceCancelWorkflowRun,
  fetchFileText,
  fetchRepo,
  fetchRepoBranches,
  fetchRepos,
  fetchRun,
  fetchRunArtifacts,
  fetchRunJob,
  fetchRunJobs,
  fetchPull,
  fetchPullComments,
  fetchPullReviews,
  fetchPulls,
  fetchRuns,
  fetchWorkflowFiles,
  fetchWorkflowRuns,
  rerunFailedJobs,
  rerunRun,
  rerunJob,
  type GithubJob,
  type GithubPullSummary,
  type GithubRepo,
  type GithubReview,
  type GithubRun,
} from '../api/github';
import { fetchGithubUser, getStoredToken, GITHUB_API, githubRequest } from '../api/githubClient';
import { ApiError } from '../api/errors';
import { parseWorkflowTarget } from '../api/githubWorkflows';
import { zipFileName } from '../utils/shareArtifact';
import { cleanGithubLog } from '../utils/githubLog';
import { mapGithubStatus } from '../utils/githubStatus';
import { CiProvider } from './CiProvider';
import type {
  Approval,
  Artifact,
  ChangeRequestFilter,
  ChangeRequestSummary,
  Credentials,
  Job,
  ProjectRef,
  Run,
  RunFilter,
  RunOptions,
  RunTarget,
  StartRunRequest,
} from './types';

const GITHUB_STATUS: Record<RunFilter, string | undefined> = {
  all: undefined,
  running: 'in_progress',
  failed: 'failure',
  success: 'success',
  canceled: 'cancelled',
};

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
  triggeredBy: run.actor?.login ?? null,
  triggeredByAvatar: run.actor?.avatar_url ?? null,
  source: run.event,
  commitTitle: run.head_commit?.message.split('\n')[0] ?? null,
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
  finishedAt: job.completed_at,
  runnerName: job.runner_name,
  webUrl: job.html_url,
});

const toChangeRequestSummary = (pull: GithubPullSummary): ChangeRequestSummary => ({
  id: String(pull.number),
  title: pull.title,
  author: pull.user?.login ?? 'ghost',
  authorAvatar: pull.user?.avatar_url ?? null,
  sourceBranch: pull.head.ref,
  targetBranch: pull.base.ref,
  state: pull.state === 'open' ? 'open' : pull.merged_at ? 'merged' : 'closed',
  draft: pull.draft ?? false,
  updatedAt: pull.updated_at,
});

const BLOCKED_REASON: Record<string, string> = {
  dirty: 'Has conflicts',
  blocked: 'Blocked by required reviews or checks',
  behind: 'Branch is behind',
  draft: 'Marked as draft',
};

// A reviewer's latest approve or request-changes review counts; comment-only reviews do not change it, a dismissed one clears it.
function reduceReviews(reviews: GithubReview[]): Approval {
  const latest = new Map<string, string>();
  for (const { user, state } of reviews) {
    if (user && ['APPROVED', 'CHANGES_REQUESTED', 'DISMISSED'].includes(state)) latest.set(user.login, state);
  }
  const reviewersWith = (state: string) => [...latest].filter(([, value]) => value === state).map(([login]) => login);
  const approvedBy = reviewersWith('APPROVED');
  const changesRequestedBy = reviewersWith('CHANGES_REQUESTED');
  return { approved: approvedBy.length > 0 && changesRequestedBy.length === 0, approvedBy, changesRequestedBy };
}

const MAX_DISPATCH_INPUTS = 25;
const FIND_RUN_TIMEOUT_MS = 15000;
const FIND_RUN_INTERVAL_MS = 2000;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function uniqueNames(targets: RunTarget[]): RunTarget[] {
  return targets.map((target) =>
    targets.filter((other) => other.name === target.name).length > 1
      ? { ...target, name: `${target.name} (${target.id})` }
      : target,
  );
}

const NO_WORKFLOWS: RunOptions = {
  targets: [],
  allowCustomInputs: false,
  notices: [{ kind: 'info', title: 'No workflows on this branch' }],
};

const NONE_RUNNABLE_NOTICE = {
  kind: 'info' as const,
  title: 'No workflow can be started manually',
  message: 'Add a workflow_dispatch trigger to a workflow file to run it from here.',
};

export class GithubProvider extends CiProvider {
  readonly id = 'github';
  readonly displayName = 'GitHub';
  readonly labels = {
    projects: 'Repositories',
    project: 'repository',
    run: 'workflow run',
    runs: 'workflow runs',
    target: 'workflow',
    changeRequest: 'Pull request',
    changeRequests: 'Pull requests',
  };
  readonly capabilities = { cancelJob: false, liveLogs: false, forceCancelRun: true, playJob: false, runVariables: false };
  readonly setup = {
    editableBaseUrl: false,
    defaultBaseUrl: 'https://api.github.com',
    tokenHint:
      'Use a classic token with the repo and workflow scopes. Create one in GitHub under Settings → Developer settings → Personal access tokens.',
  };

  async verifyCredentials({ token }: Credentials) {
    const user = await fetchGithubUser(token);
    return { username: user.login, name: user.name, avatarUrl: user.avatar_url };
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

  async getRunOptions(project: ProjectRef, branch: string): Promise<RunOptions> {
    const files = await fetchWorkflowFiles(project.key, branch);
    if (files.length === 0) return NO_WORKFLOWS;
    const targets = await Promise.all(
      files.map(async (file) => {
        try {
          return parseWorkflowTarget(file.path, await fetchFileText(project.key, file.path, branch));
        } catch {
          return parseWorkflowTarget(file.path, '');
        }
      }),
    );
    const notices = targets.some((target) => target.runnable) ? [] : [NONE_RUNNABLE_NOTICE];
    return { targets: uniqueNames(targets), allowCustomInputs: false, notices };
  }

  async startRun(project: ProjectRef, branch: string, { targetId, inputs }: StartRunRequest) {
    if (inputs.length > MAX_DISPATCH_INPUTS) {
      throw new Error(`GitHub accepts at most ${MAX_DISPATCH_INPUTS} inputs per run`);
    }
    const knownRuns = await fetchWorkflowRuns(project.key, targetId, branch);
    const lastKnownId = Math.max(0, ...knownRuns.map((run) => run.id));
    const runId = await dispatchWorkflow(project.key, targetId, {
      ref: branch,
      inputs: Object.fromEntries(inputs.map(({ key, value }) => [key, value])),
      return_run_details: true,
    });
    if (runId) return { runId: String(runId) };
    return { runId: await this.findDispatchedRun(project.key, targetId, branch, lastKnownId) };
  }

  private async findDispatchedRun(fullName: string, workflowFile: string, branch: string, lastKnownId: number) {
    const deadline = Date.now() + FIND_RUN_TIMEOUT_MS;
    while (Date.now() < deadline) {
      await sleep(FIND_RUN_INTERVAL_MS);
      const runs = await fetchWorkflowRuns(fullName, workflowFile, branch);
      const found = runs.find((run) => run.id > lastKnownId);
      if (found) return String(found.id);
    }
    return null;
  }

  async listRuns(project: ProjectRef, branch: string | null, filter: RunFilter, page: number) {
    const result = await fetchRuns(project.key, branch ?? undefined, GITHUB_STATUS[filter], page);
    return {
      ...result,
      items: result.items.map((run) => ({
        id: String(run.id),
        title: run.name ?? '',
        ref: run.head_branch ?? '',
        source: run.event,
        status: mapGithubStatus(run.status, run.conclusion),
        createdAt: run.created_at,
        updatedAt: run.updated_at,
      })),
    };
  }

  async getRun(project: ProjectRef, runId: string) {
    return toRun(await fetchRun(project.key, runId));
  }

  async listJobs(project: ProjectRef, runId: string) {
    return (await fetchRunJobs(project.key, runId)).map(toJob);
  }

  async getRunVariables(): Promise<{ key: string; value: string }[]> {
    return [];
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

  async listArtifacts(project: ProjectRef, runId: string): Promise<Artifact[]> {
    const artifacts = await fetchRunArtifacts(project.key, runId);
    return artifacts
      .filter(({ expired }) => !expired)
      .map(({ id, name, size_in_bytes }) => ({ id: String(id), name, sizeBytes: size_in_bytes, jobName: null }));
  }

  async getArtifactDownload(project: ProjectRef, artifact: Artifact) {
    return {
      url: `${GITHUB_API}/repos/${project.key}/actions/artifacts/${artifact.id}/zip`,
      headers: { Authorization: `Bearer ${await getStoredToken()}` },
      fileName: zipFileName(artifact.name),
    };
  }

  async retryRun(project: ProjectRef, runId: string) {
    const { conclusion } = await fetchRun(project.key, runId);
    if (conclusion === 'cancelled') await rerunRun(project.key, runId);
    else await rerunFailedJobs(project.key, runId);
  }

  async retryJob(project: ProjectRef, jobId: string) {
    await rerunJob(project.key, jobId);
  }

  async listChangeRequests(project: ProjectRef, filter: ChangeRequestFilter, page: number) {
    const result = await fetchPulls(project.key, filter, page);
    return { ...result, items: result.items.map(toChangeRequestSummary) };
  }

  async getChangeRequest(project: ProjectRef, id: string) {
    const [first, reviews] = await Promise.all([fetchPull(project.key, id), fetchPullReviews(project.key, id)]);
    // GitHub computes mergeability lazily, so mergeable is null on the first read
    let pull = first;
    if (pull.mergeable === null && pull.state === 'open') {
      await sleep(FIND_RUN_INTERVAL_MS);
      pull = await fetchPull(project.key, id);
    }
    const summary = toChangeRequestSummary(pull);
    return {
      ...summary,
      description: pull.body ?? '',
      webUrl: pull.html_url,
      approval: reduceReviews(reviews),
      blockedReason: summary.state === 'open' ? (BLOCKED_REASON[pull.mergeable_state] ?? null) : null,
    };
  }

  async listChangeRequestComments(project: ProjectRef, id: string) {
    const [conversation, inline] = await fetchPullComments(project.key, id);
    return [...conversation, ...inline]
      .sort((a, b) => Date.parse(a.created_at) - Date.parse(b.created_at))
      .map((comment) => ({
        id: `${comment.path ? 'review' : 'issue'}-${comment.id}`,
        author: comment.user?.login ?? 'ghost',
        authorAvatar: comment.user?.avatar_url ?? null,
        body: comment.body,
        createdAt: comment.created_at,
        location: comment.path ?? null,
      }));
  }

  async cancelRun(project: ProjectRef, runId: string) {
    await this.withFinishedHint(() => cancelWorkflowRun(project.key, runId));
  }

  async forceCancelRun(project: ProjectRef, runId: string) {
    await this.withFinishedHint(() => forceCancelWorkflowRun(project.key, runId));
  }

  private async withFinishedHint(request: () => Promise<void>) {
    try {
      await request();
    } catch (error) {
      if (error instanceof ApiError && error.status === 409) {
        throw new Error("This run can't be cancelled, it may have already finished");
      }
      throw error;
    }
  }
}
