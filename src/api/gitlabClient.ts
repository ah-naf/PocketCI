import type { Credentials, Page } from '../providers/types';
import { DEFAULT_BASE_URL, loadCredentials } from '../storage/secure';
import { GitlabError } from './errors';
import { httpRequest, type HttpRequest, type HttpResponse } from './http';

export type { Page };

type RequestOptions = HttpRequest & { auth?: Credentials };

export type GitlabResponse = HttpResponse;

export function buildQuery(params: Record<string, string | number | undefined>) {
  const parts = Object.entries(params)
    .filter(([, value]) => value !== undefined && value !== '')
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`);
  return parts.length ? `?${parts.join('&')}` : '';
}

async function getStoredAuth(): Promise<Credentials> {
  const credentials = await loadCredentials('gitlab', DEFAULT_BASE_URL);
  if (!credentials.token) throw new GitlabError('http', 401, 'No access token set');
  return credentials;
}

export async function gitlabRequest(path: string, { auth, headers, ...request }: RequestOptions = {}) {
  const { baseUrl, token } = auth ?? (await getStoredAuth());
  return httpRequest(`${baseUrl}${path}`, { ...request, headers: { 'PRIVATE-TOKEN': token, ...headers } });
}

export async function getJson<T>(path: string, options?: RequestOptions): Promise<T> {
  const { text } = await gitlabRequest(path, options);
  return JSON.parse(text) as T;
}

export async function getPage<T>(path: string, options?: RequestOptions): Promise<Page<T>> {
  const { text, headers } = await gitlabRequest(path, options);
  return { items: JSON.parse(text) as T[], nextPage: Number(headers.get('x-next-page')) || null };
}
