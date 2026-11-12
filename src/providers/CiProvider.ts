import type {
  Account,
  Artifact,
  ArtifactDownload,
  ChangeRequest,
  ChangeRequestComment,
  ChangeRequestSummary,
  Credentials,
  Job,
  LogChunk,
  Page,
  ProjectRef,
  ProviderCapabilities,
  ProviderId,
  ProviderLabels,
  ProviderSetup,
  Run,
  RunFilter,
  RunOptions,
  RunSummary,
  RunVariable,
  StartRunRequest,
} from './types';

export abstract class CiProvider {
  abstract readonly id: ProviderId;
  abstract readonly displayName: string;
  abstract readonly labels: ProviderLabels;
  abstract readonly capabilities: ProviderCapabilities;
  abstract readonly setup: ProviderSetup;

  abstract verifyCredentials(credentials: Credentials): Promise<Account>;

  abstract listProjects(query: string, page: number): Promise<Page<ProjectRef>>;
  abstract getDefaultBranch(project: ProjectRef): Promise<string | null>;
  abstract listBranches(project: ProjectRef, query: string, page: number): Promise<Page<string>>;

  abstract getRunOptions(project: ProjectRef, branch: string): Promise<RunOptions>;
  abstract startRun(
    project: ProjectRef,
    branch: string,
    request: StartRunRequest,
  ): Promise<{ runId: string | null }>;
  abstract listRuns(
    project: ProjectRef,
    branch: string | null,
    filter: RunFilter,
    page: number,
  ): Promise<Page<RunSummary>>;
  abstract getRun(project: ProjectRef, runId: string): Promise<Run>;
  abstract listJobs(project: ProjectRef, runId: string): Promise<Job[]>;
  abstract getJob(project: ProjectRef, jobId: string): Promise<Job>;
  abstract getRunVariables(project: ProjectRef, runId: string): Promise<RunVariable[]>;

  abstract listArtifacts(project: ProjectRef, runId: string): Promise<Artifact[]>;
  abstract getArtifactDownload(project: ProjectRef, artifact: Artifact): Promise<ArtifactDownload>;

  abstract readLog(project: ProjectRef, jobId: string, cursor: string | null): Promise<LogChunk>;
  abstract cleanLog(raw: string): string[];

  abstract listChangeRequests(project: ProjectRef, page: number): Promise<Page<ChangeRequestSummary>>;
  abstract getChangeRequest(project: ProjectRef, id: string): Promise<ChangeRequest>;
  abstract listChangeRequestComments(project: ProjectRef, id: string): Promise<ChangeRequestComment[]>;

  abstract cancelRun(project: ProjectRef, runId: string): Promise<void>;

  abstract retryRun(project: ProjectRef, runId: string): Promise<void>;
  abstract retryJob(project: ProjectRef, jobId: string): Promise<void>;

  forceCancelRun(project: ProjectRef, runId: string): Promise<void> {
    return Promise.reject(new Error(`Force cancel is not supported (${project.key}, ${runId})`));
  }

  playJob(project: ProjectRef, jobId: string): Promise<void> {
    return Promise.reject(new Error(`Starting a manual job is not supported (${project.key}, ${jobId})`));
  }

  cancelJob(project: ProjectRef, jobId: string): Promise<void> {
    return Promise.reject(new Error(`Cancelling a single job is not supported (${project.key}, ${jobId})`));
  }
}
