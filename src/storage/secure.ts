import * as SecureStore from 'expo-secure-store';
import type { Credentials, ProviderId } from '../providers/types';

export const DEFAULT_BASE_URL = 'https://gitlab.niftycoders.net/api/v4';

const KEYS: Record<ProviderId, { token: string; baseUrl?: string }> = {
  gitlab: { token: 'gitlab_token', baseUrl: 'gitlab_base_url' },
  github: { token: 'github_token' },
};

export async function loadCredentials(providerId: ProviderId, defaultBaseUrl: string): Promise<Credentials> {
  const keys = KEYS[providerId];
  const [baseUrl, token] = await Promise.all([
    keys.baseUrl ? SecureStore.getItemAsync(keys.baseUrl) : null,
    SecureStore.getItemAsync(keys.token),
  ]);
  return { baseUrl: baseUrl ?? defaultBaseUrl, token: token ?? '' };
}

export async function saveCredentials(providerId: ProviderId, { baseUrl, token }: Credentials) {
  const keys = KEYS[providerId];
  await Promise.all([
    keys.baseUrl ? SecureStore.setItemAsync(keys.baseUrl, baseUrl) : undefined,
    SecureStore.setItemAsync(keys.token, token),
  ]);
}

export function deleteToken(providerId: ProviderId) {
  return SecureStore.deleteItemAsync(KEYS[providerId].token);
}
