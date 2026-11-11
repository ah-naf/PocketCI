import { GitlabError } from './errors';

const TIMEOUT_MS = 15000;

export type HttpRequest = {
  method?: 'GET' | 'POST';
  headers?: Record<string, string>;
  body?: unknown;
};

export type HttpResponse = { text: string; headers: Headers; status: number };

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

export async function httpRequest(url: string, { method = 'GET', headers, body }: HttpRequest = {}): Promise<HttpResponse> {
  const response = await fetchWithTimeout(url, {
    method,
    headers: { ...(body !== undefined && { 'Content-Type': 'application/json' }), ...headers },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const text = await response.text();
  if (!response.ok) {
    throw new GitlabError('http', response.status, readErrorMessage(text, response.statusText));
  }
  return { text, headers: response.headers, status: response.status };
}
