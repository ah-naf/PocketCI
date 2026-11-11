import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'gitlab_token';
const BASE_URL_KEY = 'gitlab_base_url';

export const DEFAULT_BASE_URL = 'https://gitlab.niftycoders.net/api/v4';

export type Settings = { baseUrl: string; token: string };

export async function loadSettings(): Promise<Settings> {
  const [baseUrl, token] = await Promise.all([
    SecureStore.getItemAsync(BASE_URL_KEY),
    SecureStore.getItemAsync(TOKEN_KEY),
  ]);
  return { baseUrl: baseUrl ?? DEFAULT_BASE_URL, token: token ?? '' };
}

export async function saveSettings({ baseUrl, token }: Settings) {
  await Promise.all([
    SecureStore.setItemAsync(BASE_URL_KEY, baseUrl),
    SecureStore.setItemAsync(TOKEN_KEY, token),
  ]);
}

export function deleteToken() {
  return SecureStore.deleteItemAsync(TOKEN_KEY);
}
