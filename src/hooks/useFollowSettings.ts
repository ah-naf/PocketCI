import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import {
  DEFAULT_FOLLOW_SETTINGS,
  loadFollowSettings,
  saveFollowSettings,
  type FollowSettings,
} from '../storage/followSettings';

export function useFollowSettings() {
  const [settings, setSettings] = useState<FollowSettings>(DEFAULT_FOLLOW_SETTINGS);

  useFocusEffect(
    useCallback(() => {
      loadFollowSettings().then(setSettings);
    }, []),
  );

  const update = useCallback((change: Partial<FollowSettings>) => {
    setSettings((current) => {
      const next = { ...current, ...change };
      saveFollowSettings(next);
      return next;
    });
  }, []);

  return { settings, update };
}
