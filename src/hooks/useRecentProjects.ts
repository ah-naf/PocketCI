import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import type { ProjectRef } from '../providers/types';
import { loadRecentProjects } from '../storage/recentProjects';

export function useRecentProjects() {
  const [recent, setRecent] = useState<ProjectRef[]>([]);

  useFocusEffect(
    useCallback(() => {
      loadRecentProjects().then(setRecent);
    }, []),
  );

  return recent;
}
