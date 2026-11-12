import { useIsFocused } from '@react-navigation/native';
import { useQueries } from '@tanstack/react-query';
import { useState } from 'react';
import { ApiError } from '../api/errors';
import { useProvider } from '../providers/ProviderContext';
import type { ProjectRef, RunSummary } from '../providers/types';
import { isPipelineActive } from '../utils/status';
import { useFollowSettings } from './useFollowSettings';

export type FavoriteRun = { project: ProjectRef; runs: RunSummary[]; unavailable: boolean; loading: boolean };

const STALE_TIME_MS = 60_000;
const IDLE_POLL_FACTOR = 6;
const MIN_IDLE_POLL_MS = 60_000;

const isActiveRun = (run: RunSummary) => isPipelineActive(run.status);
const hasActiveRun = (runs: RunSummary[]) => runs.some(isActiveRun);
const rankOf = ({ runs }: FavoriteRun) => (runs[0]?.status === 'failed' ? 0 : hasActiveRun(runs) ? 1 : 2);

// One request returns the project's latest page of runs, so showing more runs per project costs nothing extra.
// Projects with an active run poll fast; the rest poll slowly so a run started elsewhere still shows up.
export function useFavoriteRuns(favorites: ProjectRef[]) {
  const provider = useProvider();
  const focused = useIsFocused();
  const { settings } = useFollowSettings();
  const [refreshing, setRefreshing] = useState(false);
  const activeIntervalMs = settings.pollSeconds * 1000;
  const idleIntervalMs = Math.max(activeIntervalMs * IDLE_POLL_FACTOR, MIN_IDLE_POLL_MS);

  const queries = useQueries({
    queries: favorites.map((project) => ({
      queryKey: [provider.id, 'recentRuns', project.key],
      queryFn: async () => (await provider.listRuns(project, null, 'all', 1)).items,
      staleTime: STALE_TIME_MS,
      enabled: focused,
      refetchInterval: (query: { state: { data?: RunSummary[]; error: unknown } }) => {
        const rateLimited = query.state.error instanceof ApiError && query.state.error.status === 429;
        const runs = query.state.data;
        if (rateLimited || runs === undefined) return false;
        return hasActiveRun(runs) ? activeIntervalMs : idleIntervalMs;
      },
    })),
  });

  const rows = favorites
    .map((project, index): FavoriteRun => {
      const { data, isError, isPending } = queries[index];
      return {
        project,
        runs: (data ?? []).slice(0, settings.runsPerProject),
        unavailable: isError && data === undefined,
        loading: isPending && !isError,
      };
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

  const activeCount = queries.reduce((total, { data }) => total + (data?.filter(isActiveRun).length ?? 0), 0);
  return { rows, reload, refreshing, activeCount };
}
