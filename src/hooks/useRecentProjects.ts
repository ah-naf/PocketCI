import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { loadRecentProjects, type RecentProject } from '../storage/recentProjects';

export function useRecentProjects() {
  const [recent, setRecent] = useState<RecentProject[]>([]);

  useFocusEffect(
    useCallback(() => {
      loadRecentProjects().then(setRecent);
    }, []),
  );

  return recent;
}
