import { useCallback, useEffect, useRef, useState } from 'react';
import type { Page } from '../api/gitlabClient';

type Busy = 'initial' | 'refresh' | 'more' | 'idle';

type State<T> = { items: T[]; nextPage: number | null; busy: Busy; error: unknown };

export function usePaginated<T>(fetchPage: (page: number) => Promise<Page<T>>) {
  const [state, setState] = useState<State<T>>({ items: [], nextPage: null, busy: 'initial', error: null });
  const latestRequest = useRef(0);

  const run = useCallback(
    async (page: number, busy: Exclude<Busy, 'idle'>) => {
      const request = ++latestRequest.current;
      setState((current) => ({
        ...current,
        busy,
        error: null,
        items: busy === 'initial' ? [] : current.items,
      }));
      try {
        const result = await fetchPage(page);
        if (request !== latestRequest.current) return;
        setState((current) => ({
          items: page === 1 ? result.items : [...current.items, ...result.items],
          nextPage: result.nextPage,
          busy: 'idle',
          error: null,
        }));
      } catch (error) {
        if (request !== latestRequest.current) return;
        setState((current) => ({ ...current, busy: 'idle', error }));
      }
    },
    [fetchPage],
  );

  useEffect(() => {
    run(1, 'initial');
  }, [run]);

  const refresh = useCallback(() => run(1, 'refresh'), [run]);

  const loadMore = useCallback(() => {
    if (state.nextPage && state.busy === 'idle') run(state.nextPage, 'more');
  }, [run, state.nextPage, state.busy]);

  return { items: state.items, busy: state.busy, error: state.error, refresh, loadMore };
}
