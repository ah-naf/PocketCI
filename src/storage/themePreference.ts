import AsyncStorage from '@react-native-async-storage/async-storage';

const THEME_KEY = 'theme_preference';

export type ThemePreference = 'dark' | 'light';

export async function loadThemePreference(): Promise<ThemePreference | null> {
  try {
    const stored = await AsyncStorage.getItem(THEME_KEY);
    return stored === 'dark' || stored === 'light' ? stored : null;
  } catch {
    return null;
  }
}

export function saveThemePreference(preference: ThemePreference) {
  return AsyncStorage.setItem(THEME_KEY, preference);
}
