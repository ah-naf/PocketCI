import { ApiError } from './errors';

const TIMEOUT_MS = 15000;

export function buildQuery(params: Record<string, string | number | undefined>) {
  const parts = Object.entries(params)
    .filter(([, value]) => value !== undefined && value !== '')
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`);
  return parts.length ? `?${parts.join('&')}` : '';
}

export type HttpRequest = {
  method?: 'GET' | 'POST' | 'PUT';
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
    throw new ApiError(controller.signal.aborted ? 'timeout' : 'network', 0, message);
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

function describeRateLimit(headers: Headers) {
  const retryAfter = Number(headers.get('retry-after'));
  const reset = Number(headers.get('x-ratelimit-reset') ?? headers.get('ratelimit-reset'));
  const resetAt = retryAfter > 0 ? Date.now() + retryAfter * 1000 : reset > 0 ? reset * 1000 : null;
  const when = resetAt ? ` Try again at ${new Date(resetAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.` : '';
  return `Rate limit reached.${when}`;
}

function isRateLimited(response: Response) {
  return response.status === 429 || (response.status === 403 && response.headers.get('x-ratelimit-remaining') === '0');
}

export async function httpRequest(url: string, { method = 'GET', headers, body }: HttpRequest = {}): Promise<HttpResponse> {
  const response = await fetchWithTimeout(url, {
    method,
    headers: { ...(body !== undefined && { 'Content-Type': 'application/json' }), ...headers },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const text = await response.text();
  if (!response.ok) {
    if (isRateLimited(response)) throw new ApiError('http', 429, describeRateLimit(response.headers));
    throw new ApiError('http', response.status, readErrorMessage(text, response.statusText));
  }
  return { text, headers: response.headers, status: response.status };
}
