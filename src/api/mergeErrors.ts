import { ApiError } from './errors';

export const TOKEN_CANNOT_MERGE = "Your token can't merge this request";
export const BRANCH_CHANGED = 'The branch changed after you opened this screen. Reload and review again';

// Replaces the message of known refusal statuses; other statuses keep the provider's own text.
export function toMergeError(error: unknown, messages: Record<number, string>) {
  if (!(error instanceof ApiError) || error.kind !== 'http' || !messages[error.status]) return error;
  return new ApiError('http', error.status === 401 ? 403 : error.status, messages[error.status]);
}
