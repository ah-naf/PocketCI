import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { loadSettings } from '../storage/secure';
import { loadProjects, type SavedProject } from '../storage/projects';

export function useProjects() {
  const [projects, setProjects] = useState<SavedProject[]>([]);
  const [host, setHost] = useState('');
  const [loaded, setLoaded] = useState(false);

  const reload = useCallback(async () => {
    const [saved, settings] = await Promise.all([loadProjects(), loadSettings()]);
    setProjects(saved);
    setHost(settings.baseUrl.replace(/^https?:\/\//, '').split('/')[0]);
    setLoaded(true);
  }, []);

  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload]),
  );

  return { projects, host, loaded, reload };
}
