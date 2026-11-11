import AsyncStorage from '@react-native-async-storage/async-storage';
import type { ProjectRef, ProviderId } from '../providers/types';

const keyFor = (providerId: ProviderId) => `favorite_projects:${providerId}`;

export async function loadFavoriteProjects(providerId: ProviderId): Promise<ProjectRef[]> {
  const raw = await AsyncStorage.getItem(keyFor(providerId));
  return raw ? (JSON.parse(raw) as ProjectRef[]) : [];
}

export async function toggleFavoriteProject(project: ProjectRef): Promise<ProjectRef[]> {
  const favorites = await loadFavoriteProjects(project.providerId);
  const isFavorite = favorites.some(({ key }) => key === project.key);
  const next = isFavorite ? favorites.filter(({ key }) => key !== project.key) : [...favorites, project];
  await AsyncStorage.setItem(keyFor(project.providerId), JSON.stringify(next));
  return next;
}
