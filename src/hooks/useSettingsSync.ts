import { useEffect, useRef, useState } from 'react';
import { AppState, Appearance } from 'react-native';
import { ApiError } from '../api/errors';
import { fetchUserData, saveUserData } from '../api/firebase';
import { refreshGitlabToken } from '../api/gitlabRefresh';
import { useProvider } from '../providers/ProviderContext';
import type { Account, ProviderId } from '../providers/types';
import { isOAuthLogin, loadCredentials } from '../storage/secure';
import {
  applySyncedSettings,
  loadSyncedAt,
  readSyncedSettings,
  saveSyncedAt,
} from '../storage/syncedSettings';
import { loadThemePreference } from '../storage/themePreference';

// React Native's URL class does not implement host, so cut it from the string.
const hostOf = (baseUrl: string) => baseUrl.replace(/^https?:\/\//i, '').split('/')[0].toLowerCase();

const buildUserId = (providerId: ProviderId, baseUrl: string, username: string) => {
  const name = username.toLowerCase();
  return providerId === 'gitlab' ? `gitlab_${hostOf(baseUrl)}_${name}` : `github_${name}`;
};

async function pushSettings(providerId: ProviderId, userId: string) {
  const updatedAt = new Date().toISOString();
  await saveUserData(userId, { data: await readSyncedSettings(providerId), updatedAt });
  await saveSyncedAt(userId, updatedAt);
}

// Remote data wins only when this device never synced the account or the remote copy is newer.
async function syncOnce(providerId: ProviderId, userId: string) {
  const [remote, syncedAt] = await Promise.all([fetchUserData(userId), loadSyncedAt(userId)]);
  if (!remote) {
    await pushSettings(providerId, userId);
    return false;
  }
  if (syncedAt !== null && remote.updatedAt <= syncedAt) return false;
  await applySyncedSettings(providerId, remote.data);
  await saveSyncedAt(userId, remote.updatedAt);
  const theme = await loadThemePreference();
  if (theme) Appearance.setColorScheme(theme);
  return true;
}

// Returns a number that changes after remote data was restored, so screens can reload.
export function useSettingsSync() {
  const provider = useProvider();
  const [restoredAt, setRestoredAt] = useState(0);
  const userId = useRef<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    userId.current = null;
    (async () => {
      const credentials = await loadCredentials(provider.id, provider.setup.defaultBaseUrl);
      let account: Account;
      try {
        account = await provider.verifyCredentials(credentials);
      } catch (error) {
        if (provider.id !== 'gitlab' || !(error instanceof ApiError) || error.status !== 401 || !(await isOAuthLogin('gitlab'))) {
          throw error;
        }
        const refreshed = await refreshGitlabToken(credentials.token);
        if (!refreshed) throw error;
        account = await provider.verifyCredentials(refreshed);
      }
      const id = buildUserId(provider.id, credentials.baseUrl, account.username);
      if (cancelled) return;
      userId.current = id;
      if (await syncOnce(provider.id, id)) setRestoredAt(Date.now());
    })().catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [provider]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'background' && userId.current) pushSettings(provider.id, userId.current).catch(() => undefined);
    });
    return () => subscription.remove();
  }, [provider]);

  return restoredAt;
}
