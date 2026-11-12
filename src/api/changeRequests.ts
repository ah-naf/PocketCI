import { buildQuery, getJson, getPage, gitlabRequest } from './gitlabClient';

type GitlabUser = { name: string; username: string; avatar_url?: string | null };

export type MergeRequestSummary = {
  iid: number;
  title: string;
  author: GitlabUser;
  source_branch: string;
  target_branch: string;
  state: string;
  draft: boolean;
  updated_at: string;
};

export type MergeRequest = MergeRequestSummary & {
  description: string | null;
  web_url: string;
  detailed_merge_status: string;
  sha: string;
  user: { can_merge: boolean };
};

export type MergeRequestApprovals = { approved: boolean; approved_by: { user: GitlabUser }[] };

export type MergeRequestNote = {
  id: number;
  body: string;
  author: GitlabUser;
  created_at: string;
  system: boolean;
  position?: { new_path?: string | null } | null;
};

export function fetchMergeRequests(projectId: number, state: 'opened' | 'merged' | 'closed' | 'all', page: number) {
  const query = buildQuery({ state, order_by: 'updated_at', sort: 'desc', per_page: 20, page });
  return getPage<MergeRequestSummary>(`/projects/${projectId}/merge_requests${query}`);
}

export function fetchMergeRequest(projectId: number, iid: number) {
  return getJson<MergeRequest>(`/projects/${projectId}/merge_requests/${iid}`);
}

export function fetchMergeRequestApprovals(projectId: number, iid: number) {
  return getJson<MergeRequestApprovals>(`/projects/${projectId}/merge_requests/${iid}/approvals`);
}

export function fetchMergeRequestNotes(projectId: number, iid: number) {
  const query = buildQuery({ sort: 'asc', per_page: 100 });
  return getJson<MergeRequestNote[]>(`/projects/${projectId}/merge_requests/${iid}/notes${query}`);
}

export async function mergeMergeRequest(projectId: number, iid: number, sha: string) {
  await gitlabRequest(`/projects/${projectId}/merge_requests/${iid}/merge`, { method: 'PUT', body: { sha } });
}
