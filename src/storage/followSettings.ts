import AsyncStorage from '@react-native-async-storage/async-storage';

export type FollowSettings = { runsPerProject: number; pollSeconds: number };

export const MAX_RUNS_PER_PROJECT = 5;
export const MIN_POLL_SECONDS = 10;
export const MAX_POLL_SECONDS = 120;
export const DEFAULT_FOLLOW_SETTINGS: FollowSettings = { runsPerProject: 1, pollSeconds: 20 };

const KEY = 'follow_settings';

const clamp = (value: unknown, min: number, max: number, fallback: number) =>
  typeof value === 'number' && Number.isFinite(value) ? Math.min(max, Math.max(min, Math.round(value))) : fallback;

export async function loadFollowSettings(): Promise<FollowSettings> {
  try {
    const stored = JSON.parse((await AsyncStorage.getItem(KEY)) ?? '{}') as Partial<FollowSettings>;
    return {
      runsPerProject: clamp(stored.runsPerProject, 1, MAX_RUNS_PER_PROJECT, DEFAULT_FOLLOW_SETTINGS.runsPerProject),
      pollSeconds: clamp(stored.pollSeconds, MIN_POLL_SECONDS, MAX_POLL_SECONDS, DEFAULT_FOLLOW_SETTINGS.pollSeconds),
    };
  } catch {
    return DEFAULT_FOLLOW_SETTINGS;
  }
}

export function saveFollowSettings(settings: FollowSettings) {
  return AsyncStorage.setItem(KEY, JSON.stringify(settings));
}
