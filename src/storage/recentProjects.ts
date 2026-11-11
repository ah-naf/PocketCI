import AsyncStorage from '@react-native-async-storage/async-storage';
import type { ProjectRef } from '../providers/types';

const RECENT_KEY = 'recent_projects';
const MAX_RECENT = 2;

type StoredProject = ProjectRef | { id: number; name: string; path: string };

const toProjectRef = (stored: StoredProject): ProjectRef =>
  'key' in stored ? stored : { providerId: 'gitlab', key: String(stored.id), name: stored.name, path: stored.path };

export async function loadRecentProjects(): Promise<ProjectRef[]> {
  const raw = await AsyncStorage.getItem(RECENT_KEY);
  return raw ? (JSON.parse(raw) as StoredProject[]).map(toProjectRef) : [];
}

export async function rememberProject(project: ProjectRef) {
  const recent = await loadRecentProjects();
  const next = [project, ...recent.filter(({ key }) => key !== project.key)].slice(0, MAX_RECENT);
  await AsyncStorage.setItem(RECENT_KEY, JSON.stringify(next));
}
