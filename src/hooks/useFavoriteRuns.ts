import { useIsFocused } from '@react-navigation/native';
import { useQueries } from '@tanstack/react-query';
import { useState } from 'react';
import { ApiError } from '../api/errors';
import { useProvider } from '../providers/ProviderContext';
import type { ProjectRef, RunSummary } from '../providers/types';
import { isPipelineActive } from '../utils/status';

export type FavoriteRun = { project: ProjectRef; run: RunSummary | null; unavailable: boolean; loading: boolean };

const POLL_INTERVAL_MS = 20_000;
const IDLE_POLL_INTERVAL_MS = 120_000;
const STALE_TIME_MS = 60_000;

const rankOf = ({ run }: FavoriteRun) => (run?.status === 'failed' ? 0 : run && isPipelineActive(run.status) ? 1 : 2);

// Active projects poll fast; the rest poll slowly so a run started elsewhere still shows up.
export function useFavoriteRuns(favorites: ProjectRef[]) {
  const provider = useProvider();
  const focused = useIsFocused();
  const [refreshing, setRefreshing] = useState(false);

  const queries = useQueries({
    queries: favorites.map((project) => ({
      queryKey: [provider.id, 'latestRun', project.key],
      queryFn: async () => (await provider.listRuns(project, null, 'all', 1)).items[0] ?? null,
      staleTime: STALE_TIME_MS,
      enabled: focused,
      refetchInterval: (query: { state: { data?: RunSummary | null; error: unknown } }) => {
        const rateLimited = query.state.error instanceof ApiError && query.state.error.status === 429;
        const run = query.state.data;
        if (rateLimited || run === undefined) return false;
        return run && isPipelineActive(run.status) ? POLL_INTERVAL_MS : IDLE_POLL_INTERVAL_MS;
      },
    })),
  });

  const rows = favorites
    .map((project, index): FavoriteRun => {
      const { data, isError, isPending } = queries[index];
      return { project, run: data ?? null, unavailable: isError && data === undefined, loading: isPending && !isError };
    })
    .sort((a, b) => rankOf(a) - rankOf(b));

  async function reload() {
    setRefreshing(true);
    try {
      await Promise.all(queries.map((query) => query.refetch()));
    } finally {
      setRefreshing(false);
    }
  }

  const anyActive = rows.some(({ run }) => run && isPipelineActive(run.status));
  return { rows, reload, refreshing, anyActive };
}
