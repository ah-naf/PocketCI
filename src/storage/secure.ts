import * as SecureStore from 'expo-secure-store';
import type { Credentials, ProviderId } from '../providers/types';

export const DEFAULT_BASE_URL = 'https://gitlab.niftycoders.net/api/v4';

type ProviderKeys = { token: string; oauth: string; baseUrl?: string; refreshToken?: string };

const KEYS: Record<ProviderId, ProviderKeys> = {
  gitlab: { token: 'gitlab_token', oauth: 'gitlab_oauth', baseUrl: 'gitlab_base_url', refreshToken: 'gitlab_refresh_token' },
  github: { token: 'github_token', oauth: 'github_oauth' },
};

function deleteOAuthKeys({ oauth, refreshToken }: ProviderKeys) {
  return [SecureStore.deleteItemAsync(oauth), refreshToken ? SecureStore.deleteItemAsync(refreshToken) : undefined];
}

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
  const tokenChanged = (await SecureStore.getItemAsync(keys.token)) !== token;
  await Promise.all([
    keys.baseUrl ? SecureStore.setItemAsync(keys.baseUrl, baseUrl) : undefined,
    SecureStore.setItemAsync(keys.token, token),
    ...(tokenChanged ? deleteOAuthKeys(keys) : []),
  ]);
}

export async function saveOAuthCredentials(providerId: ProviderId, credentials: Credentials, refreshToken?: string) {
  const keys = KEYS[providerId];
  await saveCredentials(providerId, credentials);
  await Promise.all([
    SecureStore.setItemAsync(keys.oauth, 'true'),
    keys.refreshToken && refreshToken ? SecureStore.setItemAsync(keys.refreshToken, refreshToken) : undefined,
  ]);
}

export async function isOAuthLogin(providerId: ProviderId) {
  return (await SecureStore.getItemAsync(KEYS[providerId].oauth)) === 'true';
}

export function loadRefreshToken(providerId: ProviderId) {
  const { refreshToken } = KEYS[providerId];
  return refreshToken ? SecureStore.getItemAsync(refreshToken) : Promise.resolve(null);
}

export function deleteToken(providerId: ProviderId) {
  const keys = KEYS[providerId];
  return Promise.all([SecureStore.deleteItemAsync(keys.token), ...deleteOAuthKeys(keys)]);
}
