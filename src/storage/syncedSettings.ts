import AsyncStorage from '@react-native-async-storage/async-storage';
import type { ProjectRef, ProviderId } from '../providers/types';
import { loadFavoriteProjects, saveFavoriteProjects } from './favoriteProjects';
import { loadFollowSettings, saveFollowSettings, type FollowSettings } from './followSettings';
import { loadRecentProjects, saveRecentProjects } from './recentProjects';
import { loadThemePreference, saveThemePreference, type ThemePreference } from './themePreference';

type SyncedSettings = {
  favoriteProjects: ProjectRef[];
  recentProjects: ProjectRef[];
  followSettings: FollowSettings;
  themePreference: ThemePreference | null;
};

const syncedAtKey = (userId: string) => `settings_synced_at:${userId}`;

export async function readSyncedSettings(providerId: ProviderId) {
  const [favoriteProjects, recentProjects, followSettings, themePreference] = await Promise.all([
    loadFavoriteProjects(providerId),
    loadRecentProjects(providerId),
    loadFollowSettings(),
    loadThemePreference(),
  ]);
  const settings: SyncedSettings = { favoriteProjects, recentProjects, followSettings, themePreference };
  return JSON.stringify(settings);
}

export async function applySyncedSettings(providerId: ProviderId, json: string) {
  const settings = JSON.parse(json) as Partial<SyncedSettings>;
  await Promise.all([
    Array.isArray(settings.favoriteProjects) ? saveFavoriteProjects(providerId, settings.favoriteProjects) : undefined,
    Array.isArray(settings.recentProjects) ? saveRecentProjects(providerId, settings.recentProjects) : undefined,
    settings.followSettings ? saveFollowSettings(settings.followSettings) : undefined,
    settings.themePreference ? saveThemePreference(settings.themePreference) : undefined,
  ]);
}

export function loadSyncedAt(userId: string) {
  return AsyncStorage.getItem(syncedAtKey(userId));
}

export function saveSyncedAt(userId: string, updatedAt: string) {
  return AsyncStorage.setItem(syncedAtKey(userId), updatedAt);
}
