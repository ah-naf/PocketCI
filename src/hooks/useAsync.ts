import { useCallback, useEffect, useRef, useState } from 'react';

type Mode = 'initial' | 'refresh' | 'silent';

type State<T> = { data?: T; error?: unknown; loading: boolean; refreshing: boolean };

export function useAsync<T>(load: () => Promise<T>) {
  const [state, setState] = useState<State<T>>({ loading: true, refreshing: false });
  const latestRequest = useRef(0);

  const run = useCallback(
    async (mode: Mode) => {
      const request = ++latestRequest.current;
      if (mode !== 'silent') {
        setState((current) => ({
          ...current,
          loading: mode === 'initial',
          refreshing: mode === 'refresh',
          error: undefined,
        }));
      }
      try {
        const data = await load();
        if (request === latestRequest.current) setState({ data, loading: false, refreshing: false });
      } catch (error) {
        if (request !== latestRequest.current) return;
        setState((current) =>
          mode === 'silent'
            ? { ...current, loading: false, refreshing: false }
            : { error, loading: false, refreshing: false },
        );
      }
    },
    [load],
  );

  useEffect(() => {
    run('initial');
  }, [run]);

  const reload = useCallback(() => run('refresh'), [run]);
  const poll = useCallback(() => run('silent'), [run]);

  return { ...state, reload, poll };
}
