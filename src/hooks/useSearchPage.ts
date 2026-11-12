import { useCallback, useState } from 'react';
import type { Page } from '../providers/types';
import { useDebounce } from './useDebounce';
import { usePaginated } from './usePaginated';

const SEARCH_STALE_TIME_MS = 5 * 60_000;

export function useSearchPage<T>(
  key: readonly unknown[],
  fetchWithQuery: (query: string, page: number) => Promise<Page<T>>,
) {
  const [search, setSearch] = useState('');
  const query = useDebounce(search.trim(), 300);
  const fetchPage = useCallback((page: number) => fetchWithQuery(query, page), [fetchWithQuery, query]);
  const list = usePaginated([...key, query], fetchPage, { staleTimeMs: SEARCH_STALE_TIME_MS });
  return { search, setSearch, query, ...list };
}
