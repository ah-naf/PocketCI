import type { Credentials } from '../providers/types';
import { DEFAULT_BASE_URL, deleteToken, loadCredentials, loadRefreshToken, saveOAuthCredentials } from '../storage/secure';
import { gitlabDeviceFlow, GITLAB_CLIENT_ID } from './gitlabAuth';
import { buildQuery, httpRequest } from './http';

let refreshInFlight: Promise<Credentials | null> | null = null;

async function refreshStoredToken(staleToken: string): Promise<Credentials | null> {
  const current = await loadCredentials('gitlab', DEFAULT_BASE_URL);
  // another request already refreshed while this one was failing
  if (current.token !== staleToken) return { ...current, oauth: true };
  const refreshToken = await loadRefreshToken('gitlab');
  if (!refreshToken) return null;
  try {
    const { text } = await httpRequest(
      `${gitlabDeviceFlow(current.baseUrl).tokenUrl}${buildQuery({
        client_id: GITLAB_CLIENT_ID,
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
      })}`,
      { method: 'POST', headers: { Accept: 'application/json' } },
    );
    const data = JSON.parse(text) as { access_token: string; refresh_token?: string };
    const refreshed = { baseUrl: current.baseUrl, token: data.access_token };
    await saveOAuthCredentials('gitlab', refreshed, data.refresh_token);
    return { ...refreshed, oauth: true };
  } catch {
    await deleteToken('gitlab');
    return null;
  }
}

export function refreshGitlabToken(staleToken: string) {
  refreshInFlight ??= refreshStoredToken(staleToken).finally(() => {
    refreshInFlight = null;
  });
  return refreshInFlight;
}
