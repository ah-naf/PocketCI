import {
  fetchMergeRequest,
  fetchMergeRequestApprovals,
  fetchMergeRequestNotes,
  fetchMergeRequests,
  type MergeRequestSummary,
} from '../api/changeRequests';
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
import { DEFAULT_BASE_URL, loadCredentials } from '../storage/secure';
import { zipFileName } from '../utils/shareArtifact';
import { parseLog } from '../utils/log';
import { CiProvider } from './CiProvider';
import type {
  Artifact,
  ChangeRequestFilter,
  ChangeRequestState,
  ChangeRequestSummary,
  Job,
  Notice,
  ProjectRef,
  Run,
  RunFilter,
  RunOptions,
  StartRunRequest,
} from './types';

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
  triggeredByAvatar: pipeline.user?.avatar_url ?? null,
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

const MERGE_REQUEST_STATE: Record<string, ChangeRequestState> = { opened: 'open', merged: 'merged', closed: 'closed' };

const toChangeRequestSummary = (mergeRequest: MergeRequestSummary): ChangeRequestSummary => ({
  id: String(mergeRequest.iid),
  title: mergeRequest.title,
  author: mergeRequest.author.name || mergeRequest.author.username,
  authorAvatar: mergeRequest.author.avatar_url ?? null,
  sourceBranch: mergeRequest.source_branch,
  targetBranch: mergeRequest.target_branch,
  state: MERGE_REQUEST_STATE[mergeRequest.state] ?? 'closed',
  draft: mergeRequest.draft,
  updatedAt: mergeRequest.updated_at,
});

const BLOCKED_REASON: Record<string, string> = {
  conflict: 'Has conflicts',
  not_approved: 'Needs approval',
  ci_must_pass: 'Pipeline must pass',
  draft_status: 'Marked as draft',
  discussions_not_resolved: 'Unresolved discussions',
};

// Statuses that are not a block: the request can merge, or the state is already final.
const NOT_BLOCKED = ['mergeable', 'not_open'];

function blockedReason(status: string) {
  return NOT_BLOCKED.includes(status) ? null : (BLOCKED_REASON[status] ?? status.replace(/_/g, ' '));
}

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
    changeRequest: 'Merge request',
    changeRequests: 'Merge requests',
  };
  readonly capabilities = { cancelJob: true, liveLogs: true, forceCancelRun: false, playJob: true, runVariables: true };
  readonly setup = {
    editableBaseUrl: true,
    defaultBaseUrl: DEFAULT_BASE_URL,
    tokenHint: 'The token needs the api scope. Create one in GitLab under Preferences → Access tokens.',
  };

  async verifyCredentials(credentials: { baseUrl: string; token: string }) {
    const user = await fetchCurrentUser(credentials);
    return { username: user.username, name: user.name, avatarUrl: user.avatar_url };
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

  async listArtifacts(project: ProjectRef, runId: string): Promise<Artifact[]> {
    const jobs = await fetchJobs(Number(project.key), Number(runId));
    return jobs.flatMap((job) =>
      job.artifacts_file
        ? [{ id: String(job.id), name: `${job.name} artifacts`, sizeBytes: job.artifacts_file.size, jobName: job.name }]
        : [],
    );
  }

  async getArtifactDownload(project: ProjectRef, artifact: Artifact) {
    const { baseUrl, token } = await loadCredentials('gitlab', DEFAULT_BASE_URL);
    return {
      url: `${baseUrl}/projects/${project.key}/jobs/${artifact.id}/artifacts`,
      // Bearer, not PRIVATE-TOKEN: native HTTP clients drop Authorization on a cross-host redirect to object storage, custom headers are not dropped
      headers: { Authorization: `Bearer ${token}` },
      fileName: zipFileName(artifact.jobName ?? artifact.name),
    };
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

  async listChangeRequests(project: ProjectRef, filter: ChangeRequestFilter, page: number) {
    const result = await fetchMergeRequests(Number(project.key), filter === 'open' ? 'opened' : filter, page);
    return { ...result, items: result.items.map(toChangeRequestSummary) };
  }

  async getChangeRequest(project: ProjectRef, id: string) {
    const projectId = Number(project.key);
    const [mergeRequest, approvals] = await Promise.all([
      fetchMergeRequest(projectId, Number(id)),
      fetchMergeRequestApprovals(projectId, Number(id)),
    ]);
    return {
      ...toChangeRequestSummary(mergeRequest),
      description: mergeRequest.description ?? '',
      webUrl: mergeRequest.web_url,
      approval: {
        approved: approvals.approved,
        approvedBy: approvals.approved_by.map(({ user }) => user.name || user.username),
        changesRequestedBy: [],
      },
      blockedReason: blockedReason(mergeRequest.detailed_merge_status),
    };
  }

  async listChangeRequestComments(project: ProjectRef, id: string) {
    const notes = await fetchMergeRequestNotes(Number(project.key), Number(id));
    return notes
      .filter((note) => !note.system)
      .map((note) => ({
        id: String(note.id),
        author: note.author.name || note.author.username,
        authorAvatar: note.author.avatar_url ?? null,
        body: note.body,
        createdAt: note.created_at,
        location: note.position?.new_path ?? null,
      }));
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
