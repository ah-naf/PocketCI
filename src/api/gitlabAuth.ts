import { DEFAULT_BASE_URL, isOAuthLogin, loadCredentials } from '../storage/secure';
import type { DeviceFlowConfig } from './deviceFlow';
import { buildQuery, httpRequest } from './http';

export const GITLAB_CLIENT_ID = '2bf7d3b738693e01c7f626582661ab1a5a8e86b04bf70421dff2f12cba1a2bd6';

export function gitlabDeviceFlow(baseUrl: string): DeviceFlowConfig {
  const origin = baseUrl.replace(/\/api\/v4\/?$/, '').replace(/\/+$/, '');
  return {
    clientId: GITLAB_CLIENT_ID,
    scope: 'api',
    deviceCodeUrl: `${origin}/oauth/authorize_device`,
    tokenUrl: `${origin}/oauth/token`,
  };
}

function hostOf(url: string) {
  return url.trim().toLowerCase().replace(/^https?:\/\//, '').split('/')[0];
}

export function isDefaultGitlabInstance(baseUrl: string) {
  return hostOf(baseUrl) === hostOf(DEFAULT_BASE_URL);
}

export async function revokeGitlabToken() {
  if (!(await isOAuthLogin('gitlab'))) return;
  const { baseUrl, token } = await loadCredentials('gitlab', DEFAULT_BASE_URL);
  const { tokenUrl } = gitlabDeviceFlow(baseUrl);
  // Best effort: signing out must work offline too
  await httpRequest(`${tokenUrl.replace(/token$/, 'revoke')}${buildQuery({ client_id: GITLAB_CLIENT_ID, token })}`, {
    method: 'POST',
  }).catch(() => undefined);
}
