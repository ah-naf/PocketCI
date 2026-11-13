import AsyncStorage from '@react-native-async-storage/async-storage';
import type { ProjectRef, ProviderId } from '../providers/types';

const LEGACY_KEY = 'recent_projects';
const MAX_RECENT = 2;

type StoredProject = ProjectRef | { id: number; name: string; path: string };

const keyFor = (providerId: ProviderId) => `recent_projects:${providerId}`;

const toProjectRef = (stored: StoredProject): ProjectRef =>
  'key' in stored ? stored : { providerId: 'gitlab', key: String(stored.id), name: stored.name, path: stored.path };

export async function loadRecentProjects(providerId: ProviderId): Promise<ProjectRef[]> {
  let raw = await AsyncStorage.getItem(keyFor(providerId));
  if (raw === null && providerId === 'gitlab') raw = await AsyncStorage.getItem(LEGACY_KEY);
  return raw ? (JSON.parse(raw) as StoredProject[]).map(toProjectRef) : [];
}

export async function saveRecentProjects(providerId: ProviderId, projects: ProjectRef[]) {
  await AsyncStorage.setItem(keyFor(providerId), JSON.stringify(projects));
  if (providerId === 'gitlab') await AsyncStorage.removeItem(LEGACY_KEY);
}

export async function clearRecentProjects(providerId: ProviderId) {
  await AsyncStorage.removeItem(keyFor(providerId));
  if (providerId === 'gitlab') await AsyncStorage.removeItem(LEGACY_KEY);
}

export async function rememberProject(project: ProjectRef) {
  const recent = await loadRecentProjects(project.providerId);
  const next = [project, ...recent.filter(({ key }) => key !== project.key)].slice(0, MAX_RECENT);
  await saveRecentProjects(project.providerId, next);
}
