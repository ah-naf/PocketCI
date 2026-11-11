import { loadSettings, type Settings } from '../storage/secure';
import type { Page } from '../providers/types';
import { GitlabError } from './errors';

export type { Page };

const TIMEOUT_MS = 15000;

type RequestOptions = {
  method?: 'GET' | 'POST';
  body?: unknown;
  headers?: Record<string, string>;
  auth?: Settings;
};

export type GitlabResponse = { text: string; headers: Headers; status: number };

export function buildQuery(params: Record<string, string | number | undefined>) {
  const parts = Object.entries(params)
    .filter(([, value]) => value !== undefined && value !== '')
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`);
  return parts.length ? `?${parts.join('&')}` : '';
}

async function getStoredAuth(): Promise<Settings> {
  const settings = await loadSettings();
  if (!settings.token) throw new GitlabError('http', 401, 'No access token set');
  return settings;
}

async function fetchWithTimeout(url: string, init: RequestInit) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Request failed';
    throw new GitlabError(controller.signal.aborted ? 'timeout' : 'network', 0, message);
  } finally {
    clearTimeout(timer);
  }
}

function readErrorMessage(text: string, fallback: string) {
  try {
    const data: unknown = JSON.parse(text);
    if (data && typeof data === 'object') {
      const { message, error_description, error } = data as Record<string, unknown>;
      const found = message ?? error_description ?? error;
      if (found !== undefined) return typeof found === 'string' ? found : JSON.stringify(found);
    }
  } catch {
    return text || fallback;
  }
  return text || fallback;
}

export async function gitlabRequest(
  path: string,
  { method = 'GET', body, headers, auth }: RequestOptions = {},
): Promise<GitlabResponse> {
  const { baseUrl, token } = auth ?? (await getStoredAuth());
  const response = await fetchWithTimeout(`${baseUrl}${path}`, {
    method,
    headers: {
      'PRIVATE-TOKEN': token,
      ...(body !== undefined && { 'Content-Type': 'application/json' }),
      ...headers,
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const text = await response.text();
  if (!response.ok) {
    throw new GitlabError('http', response.status, readErrorMessage(text, response.statusText));
  }
  return { text, headers: response.headers, status: response.status };
}

export async function getJson<T>(path: string, options?: RequestOptions): Promise<T> {
  const { text } = await gitlabRequest(path, options);
  return JSON.parse(text) as T;
}

export async function getPage<T>(path: string, options?: RequestOptions): Promise<Page<T>> {
  const { text, headers } = await gitlabRequest(path, options);
  return { items: JSON.parse(text) as T[], nextPage: Number(headers.get('x-next-page')) || null };
}
