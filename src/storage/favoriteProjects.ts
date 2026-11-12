import AsyncStorage from '@react-native-async-storage/async-storage';
import type { ProjectRef, ProviderId } from '../providers/types';

export const MAX_FOLLOWED_PROJECTS = 10;

const keyFor = (providerId: ProviderId) => `favorite_projects:${providerId}`;

export async function loadFavoriteProjects(providerId: ProviderId): Promise<ProjectRef[]> {
  const raw = await AsyncStorage.getItem(keyFor(providerId));
  return raw ? (JSON.parse(raw) as ProjectRef[]) : [];
}

// Returns null when the follow limit blocks adding another project.
export async function toggleFavoriteProject(project: ProjectRef): Promise<ProjectRef[] | null> {
  const favorites = await loadFavoriteProjects(project.providerId);
  const isFavorite = favorites.some(({ key }) => key === project.key);
  if (!isFavorite && favorites.length >= MAX_FOLLOWED_PROJECTS) return null;
  const next = isFavorite ? favorites.filter(({ key }) => key !== project.key) : [...favorites, project];
  await AsyncStorage.setItem(keyFor(project.providerId), JSON.stringify(next));
  return next;
}
