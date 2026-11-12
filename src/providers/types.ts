export type ProviderId = 'gitlab' | 'github';

export type RunStatus = string;

export type RunFilter = 'all' | 'running' | 'failed' | 'success' | 'canceled';

export type Page<T> = { items: T[]; nextPage: number | null };

export type ProjectRef = { providerId: ProviderId; key: string; name: string; path: string };

export type RunInput = { key: string; label: string; defaultValue: string; options: string[] };

export type RunTarget = {
  id: string;
  name: string;
  runnable: boolean;
  reason?: string;
  inputs: RunInput[];
};

export type Notice = { kind: 'error' | 'info'; title: string; message?: string; detail?: string };

export type RunOptions = { targets: RunTarget[]; allowCustomInputs: boolean; notices: Notice[] };

export type StartRunRequest = { targetId: string; inputs: { key: string; value: string }[] };

export type RunSummary = {
  id: string;
  title: string;
  ref: string;
  source: string;
  status: RunStatus;
  createdAt: string;
  updatedAt: string;
};

export type Run = {
  id: string;
  status: RunStatus;
  ref: string;
  sha: string;
  webUrl: string;
  createdAt: string;
  startedAt: string | null;
  finishedAt: string | null;
  durationSeconds: number | null;
  triggeredBy: string | null;
  triggeredByAvatar: string | null;
  source: string | null;
  commitTitle: string | null;
};

export type Job = {
  id: string;
  name: string;
  group: string;
  status: RunStatus;
  durationSeconds: number | null;
  startedAt: string | null;
  finishedAt: string | null;
  runnerName: string | null;
  webUrl: string;
};

export type Artifact = { id: string; name: string; sizeBytes: number | null; jobName: string | null };

export type ArtifactDownload = { url: string; headers: Record<string, string>; fileName: string };

export type RunVariable = { key: string; value: string };

export type LogChunk = { text: string; cursor: string | null; replace: boolean };

export type Credentials = { baseUrl: string; token: string };

export type Account = { username: string; name: string | null; avatarUrl: string | null };

export type ChangeRequestState = 'open' | 'merged' | 'closed';

// 'closed' means closed without merging
export type ChangeRequestFilter = 'open' | 'merged' | 'closed' | 'all';

export type ChangeRequestSummary = {
  id: string;
  title: string;
  author: string;
  authorAvatar: string | null;
  sourceBranch: string;
  targetBranch: string;
  state: ChangeRequestState;
  draft: boolean;
  updatedAt: string;
};

export type Approval = { approved: boolean; approvedBy: string[]; changesRequestedBy: string[] };

export type ChangeRequest = ChangeRequestSummary & {
  description: string;
  webUrl: string;
  approval: Approval;
  blockedReason: string | null;
};

export type ChangeRequestComment = {
  id: string;
  author: string;
  authorAvatar: string | null;
  body: string;
  createdAt: string;
  location: string | null;
};

export type ProviderLabels = {
  projects: string;
  project: string;
  run: string;
  runs: string;
  target: string;
  changeRequest: string;
  changeRequests: string;
};

export type ProviderCapabilities = { cancelJob: boolean; liveLogs: boolean; forceCancelRun: boolean; playJob: boolean; runVariables: boolean };

export type ProviderSetup = { editableBaseUrl: boolean; defaultBaseUrl: string; tokenHint: string };
