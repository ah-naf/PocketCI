import { getJson, getPage, buildQuery } from './gitlabClient';

export type Project = {
  id: number;
  name: string;
  path_with_namespace: string;
  default_branch: string | null;
};

export type Branch = { name: string };

export function fetchProject(id: number | string) {
  return getJson<Project>(`/projects/${id}`);
}

export function fetchBranches(projectId: number, search: string, page: number) {
  const query = buildQuery({ per_page: 100, search, page });
  return getPage<Branch>(`/projects/${projectId}/repository/branches${query}`);
}
