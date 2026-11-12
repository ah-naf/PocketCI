import { useCallback, useMemo } from 'react';
import { useProvider } from '../providers/ProviderContext';
import type { ProjectRef, RunSummary } from '../providers/types';
import { useAsync } from './useAsync';

export type FavoriteRun = { project: ProjectRef; run: RunSummary | null; unavailable: boolean };

const rankOf = ({ run }: FavoriteRun) => (run?.status === 'failed' ? 0 : run?.status === 'running' ? 1 : 2);

export function useFavoriteRuns(favorites: ProjectRef[]) {
  const provider = useProvider();

  const load = useCallback(
    () =>
      Promise.all(
        favorites.map(async (project): Promise<FavoriteRun> => {
          try {
            const page = await provider.listRuns(project, null, 'all', 1);
            return { project, run: page.items[0] ?? null, unavailable: false };
          } catch {
            return { project, run: null, unavailable: true };
          }
        }),
      ),
    [provider, favorites],
  );
  const { data, reload, refreshing } = useAsync(['favoriteRuns', ...favorites.map((project) => project.key)], load);

  const rows = useMemo(() => [...(data ?? [])].sort((a, b) => rankOf(a) - rankOf(b)), [data]);
  return { rows, reload, refreshing };
}
