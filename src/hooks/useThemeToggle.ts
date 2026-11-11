import { Appearance, useColorScheme } from 'react-native';
import { saveThemePreference } from '../storage/themePreference';

export function useThemeToggle() {
  const scheme = useColorScheme() === 'light' ? 'light' : 'dark';
  const next = scheme === 'dark' ? 'light' : 'dark';

  function toggle() {
    Appearance.setColorScheme(next);
    saveThemePreference(next);
  }

  return { nextScheme: next, toggle };
}
