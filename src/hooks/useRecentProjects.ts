import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import type { ProjectRef, ProviderId } from '../providers/types';
import { loadRecentProjects } from '../storage/recentProjects';

export function useRecentProjects(providerId: ProviderId) {
  const [recent, setRecent] = useState<ProjectRef[]>([]);

  useFocusEffect(
    useCallback(() => {
      setRecent([]);
      loadRecentProjects(providerId).then(setRecent);
    }, [providerId]),
  );

  return recent;
}
