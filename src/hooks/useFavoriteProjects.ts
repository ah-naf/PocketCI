import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import type { ProjectRef, ProviderId } from '../providers/types';
import { loadFavoriteProjects, toggleFavoriteProject } from '../storage/favoriteProjects';

export function useFavoriteProjects(providerId: ProviderId) {
  const [favorites, setFavorites] = useState<ProjectRef[]>([]);

  useFocusEffect(
    useCallback(() => {
      setFavorites([]);
      loadFavoriteProjects(providerId).then(setFavorites);
    }, [providerId]),
  );

  const toggle = useCallback(async (project: ProjectRef) => setFavorites(await toggleFavoriteProject(project)), []);

  return { favorites, toggle };
}
