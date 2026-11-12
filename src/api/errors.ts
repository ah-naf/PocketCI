export type ApiErrorKind = 'http' | 'timeout' | 'network';

export class ApiError extends Error {
  constructor(
    readonly kind: ApiErrorKind,
    readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export type FriendlyError = { title: string; message: string; detail?: string };

export function describeError(error: unknown, service = 'GitLab'): FriendlyError {
  if (!(error instanceof ApiError)) {
    return {
      title: 'Something went wrong',
      message: error instanceof Error ? error.message : String(error),
    };
  }

  if (error.kind !== 'http') {
    return {
      title: `Can't reach ${service}`,
      message: `Check your connection or VPN. This ${service} may only be reachable on the company network. If you are connected, the phone may not trust the server's certificate.`,
      detail: error.message,
    };
  }

  const detail = `HTTP ${error.status} · ${error.message}`;
  switch (error.status) {
    case 401:
      return {
        title: `${service} rejected the token`,
        message:
          'It may have expired or been revoked, or it is missing the api scope. Paste a new one and test again.',
        detail,
      };
    case 403:
      return { title: 'Permission denied', message: error.message, detail };
    case 429:
      return { title: 'Rate limit reached', message: error.message, detail };
    case 404:
      return {
        title: 'Not found',
        message: 'The project or branch does not exist, or the token cannot see it.',
        detail,
      };
    default:
      return { title: `Request failed (${error.status})`, message: error.message, detail };
  }
}
