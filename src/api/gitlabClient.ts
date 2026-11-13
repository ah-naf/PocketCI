import type { Credentials, Page } from '../providers/types';
import { DEFAULT_BASE_URL, isOAuthLogin, loadCredentials } from '../storage/secure';
import { ApiError } from './errors';
import { refreshGitlabToken } from './gitlabRefresh';
import { buildQuery, httpRequest, type HttpRequest, type HttpResponse } from './http';

export { buildQuery };
export type { Page };

type RequestOptions = HttpRequest & { auth?: Credentials };

export type GitlabResponse = HttpResponse;

async function getStoredAuth(): Promise<Credentials> {
  const [credentials, oauth] = await Promise.all([loadCredentials('gitlab', DEFAULT_BASE_URL), isOAuthLogin('gitlab')]);
  if (!credentials.token) throw new ApiError('http', 401, 'No access token set');
  return { ...credentials, oauth };
}

export async function gitlabRequest(path: string, { auth, headers, ...request }: RequestOptions = {}) {
  const send = ({ baseUrl, token, oauth }: Credentials) =>
    httpRequest(`${baseUrl}${path}`, {
      ...request,
      // OAuth tokens only work as Bearer, personal access tokens keep PRIVATE-TOKEN
      headers: { ...(oauth ? { Authorization: `Bearer ${token}` } : { 'PRIVATE-TOKEN': token }), ...headers },
    });
  const credentials = auth ?? (await getStoredAuth());
  try {
    return await send(credentials);
  } catch (error) {
    if (auth || !credentials.oauth || !(error instanceof ApiError) || error.status !== 401) throw error;
    const refreshed = await refreshGitlabToken(credentials.token);
    if (!refreshed) throw error;
    return send(refreshed);
  }
}

export async function getJson<T>(path: string, options?: RequestOptions): Promise<T> {
  const { text } = await gitlabRequest(path, options);
  return JSON.parse(text) as T;
}

export async function getPage<T>(path: string, options?: RequestOptions): Promise<Page<T>> {
  const { text, headers } = await gitlabRequest(path, options);
  return { items: JSON.parse(text) as T[], nextPage: Number(headers.get('x-next-page')) || null };
}
