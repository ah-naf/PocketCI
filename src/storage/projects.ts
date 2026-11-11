import AsyncStorage from '@react-native-async-storage/async-storage';

const PROJECTS_KEY = 'saved_projects';

export type SavedProject = { id: number; name: string; path: string };

export async function loadProjects(): Promise<SavedProject[]> {
  const raw = await AsyncStorage.getItem(PROJECTS_KEY);
  return raw ? (JSON.parse(raw) as SavedProject[]) : [];
}

function writeProjects(projects: SavedProject[]) {
  return AsyncStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
}

export async function addProject(project: SavedProject) {
  const projects = await loadProjects();
  await writeProjects([...projects.filter(({ id }) => id !== project.id), project]);
}

export async function removeProject(id: number) {
  const projects = await loadProjects();
  await writeProjects(projects.filter((project) => project.id !== id));
}
