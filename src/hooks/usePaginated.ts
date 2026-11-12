import { useIsFocused } from '@react-navigation/native';
import { useInfiniteQuery, useQueryClient, type InfiniteData } from '@tanstack/react-query';
import { useCallback, useState } from 'react';
import { useProvider } from '../providers/ProviderContext';
import type { Page } from '../providers/types';

export type Busy = 'initial' | 'refresh' | 'more' | 'idle';

type Options<T> = { staleTimeMs?: number; refetchIntervalMs?: (items: T[]) => number | false };

export function usePaginated<T>(
  key: readonly unknown[],
  fetchPage: (page: number) => Promise<Page<T>>,
  options: Options<T> = {},
) {
  const provider = useProvider();
  const queryClient = useQueryClient();
  const focused = useIsFocused();
  const [refreshing, setRefreshing] = useState(false);
  const queryKey = [provider.id, ...key];

  const query = useInfiniteQuery({
    queryKey,
    queryFn: ({ pageParam }) => fetchPage(pageParam),
    initialPageParam: 1,
    getNextPageParam: (last) => last.nextPage ?? undefined,
    staleTime: options.staleTimeMs,
    refetchInterval: (current) => {
      const pages = current.state.data?.pages ?? [];
      if (!focused || pages.length > 1) return false;
      return options.refetchIntervalMs?.(pages.flatMap((page) => page.items)) ?? false;
    },
  });
  const { refetch, fetchNextPage, hasNextPage, isFetching, isFetchingNextPage } = query;

  // Refetching an infinite query reloads every loaded page; keep only page 1 so one request is sent.
  async function refresh() {
    setRefreshing(true);
    try {
      queryClient.setQueryData<InfiniteData<Page<T>, number>>(queryKey, (data) =>
        data && { pages: data.pages.slice(0, 1), pageParams: data.pageParams.slice(0, 1) },
      );
      await refetch();
    } finally {
      setRefreshing(false);
    }
  }

  const loadMore = useCallback(() => {
    if (hasNextPage && !isFetching) fetchNextPage();
  }, [hasNextPage, isFetching, fetchNextPage]);

  const poll = useCallback(() => {
    if (!isFetching && (query.data?.pages.length ?? 0) <= 1) refetch();
  }, [isFetching, query.data, refetch]);

  const busy: Busy = query.isLoading ? 'initial' : refreshing ? 'refresh' : isFetchingNextPage ? 'more' : 'idle';
  const failure = query.error && !query.data ? query.error : null;

  return {
    items: query.data?.pages.flatMap((page) => page.items) ?? [],
    busy,
    error: failure,
    hasMore: hasNextPage,
    refresh,
    loadMore,
    poll,
  };
}
