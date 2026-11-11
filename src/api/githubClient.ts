import type { Page } from '../providers/types';
import { loadCredentials } from '../storage/secure';
import { ApiError } from './errors';
import { httpRequest, type HttpRequest } from './http';

const GITHUB_API = 'https://api.github.com';

type GithubRequest = HttpRequest & { token?: string };

async function getStoredToken() {
  const { token } = await loadCredentials('github', GITHUB_API);
  if (!token) throw new ApiError('http', 401, 'No access token set');
  return token;
}

export async function githubRequest(path: string, { token, headers, ...request }: GithubRequest = {}) {
  const bearer = token ?? (await getStoredToken());
  return httpRequest(`${GITHUB_API}${path}`, {
    ...request,
    headers: {
      Authorization: `Bearer ${bearer}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      ...headers,
    },
  });
}

export async function githubGetJson<T>(path: string): Promise<T> {
  const { text } = await githubRequest(path);
  return JSON.parse(text) as T;
}

export async function githubGetPage<T>(path: string): Promise<Page<T>> {
  const { text, headers } = await githubRequest(path);
  const next = /<[^>]*[?&]page=(\d+)[^>]*>;\s*rel="next"/.exec(headers.get('link') ?? '');
  return { items: JSON.parse(text) as T[], nextPage: next ? Number(next[1]) : null };
}

export async function fetchGithubLogin(token: string) {
  const { text } = await githubRequest('/user', { token });
  return (JSON.parse(text) as { login: string }).login;
}
