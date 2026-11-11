import AsyncStorage from '@react-native-async-storage/async-storage';

const RECENT_KEY = 'recent_projects';
const MAX_RECENT = 2;

export type RecentProject = { id: number; name: string; path: string };

export async function loadRecentProjects(): Promise<RecentProject[]> {
  const raw = await AsyncStorage.getItem(RECENT_KEY);
  return raw ? (JSON.parse(raw) as RecentProject[]) : [];
}

export async function rememberProject(project: RecentProject) {
  const recent = await loadRecentProjects();
  const next = [project, ...recent.filter(({ id }) => id !== project.id)].slice(0, MAX_RECENT);
  await AsyncStorage.setItem(RECENT_KEY, JSON.stringify(next));
}
