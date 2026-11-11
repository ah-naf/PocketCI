import { useCallback, useState } from 'react';
import type { Page } from '../providers/types';
import { useDebounce } from './useDebounce';
import { usePaginated } from './usePaginated';

export function useSearchPage<T>(fetchWithQuery: (query: string, page: number) => Promise<Page<T>>) {
  const [search, setSearch] = useState('');
  const query = useDebounce(search.trim(), 300);
  const fetchPage = useCallback((page: number) => fetchWithQuery(query, page), [fetchWithQuery, query]);
  const list = usePaginated(fetchPage);
  return { search, setSearch, query, ...list };
}
