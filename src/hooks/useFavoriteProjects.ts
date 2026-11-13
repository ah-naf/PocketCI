import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import type { ProjectRef, ProviderId } from '../providers/types';
import { loadFavoriteProjects, toggleFavoriteProject } from '../storage/favoriteProjects';

export function useFavoriteProjects(providerId: ProviderId, refreshKey = 0) {
  const [favorites, setFavorites] = useState<ProjectRef[]>([]);

  useFocusEffect(
    useCallback(() => {
      setFavorites([]);
      loadFavoriteProjects(providerId).then(setFavorites);
    }, [providerId, refreshKey]),
  );

  const toggle = useCallback(async (project: ProjectRef) => {
    const next = await toggleFavoriteProject(project);
    if (next) setFavorites(next);
    return next !== null;
  }, []);

  return { favorites, toggle };
}
