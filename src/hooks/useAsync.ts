import { useIsFocused } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { useCallback, useState } from 'react';
import { useProvider } from '../providers/ProviderContext';

type Options<T> = { staleTimeMs?: number; refetchIntervalMs?: (data: T | undefined) => number | false };

export function useAsync<T>(key: readonly unknown[], load: () => Promise<T>, options: Options<T> = {}) {
  const provider = useProvider();
  const focused = useIsFocused();
  const [refreshing, setRefreshing] = useState(false);

  const query = useQuery({
    queryKey: [provider.id, ...key],
    queryFn: load,
    staleTime: options.staleTimeMs,
    refetchInterval: (current) => (focused ? (options.refetchIntervalMs?.(current.state.data) ?? false) : false),
  });
  const { refetch } = query;

  const reload = useCallback(async () => {
    setRefreshing(true);
    try {
      await refetch();
    } finally {
      setRefreshing(false);
    }
  }, [refetch]);
  const poll = useCallback(() => {
    refetch();
  }, [refetch]);

  // A failed background refetch keeps the data on screen instead of replacing it with an error.
  const error = query.data === undefined ? query.error : undefined;
  return { data: query.data, error: error ?? undefined, loading: query.isLoading, refreshing, reload, poll };
}
