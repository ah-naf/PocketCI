import { useCallback, useEffect, useRef, useState } from 'react';

type State<T> = { data?: T; error?: unknown; loading: boolean; refreshing: boolean };

export function useAsync<T>(load: () => Promise<T>) {
  const [state, setState] = useState<State<T>>({ loading: true, refreshing: false });
  const latestRequest = useRef(0);

  const run = useCallback(
    async (refreshing: boolean) => {
      const request = ++latestRequest.current;
      setState((current) => ({ ...current, loading: !refreshing, refreshing, error: undefined }));
      try {
        const data = await load();
        if (request === latestRequest.current) setState({ data, loading: false, refreshing: false });
      } catch (error) {
        if (request === latestRequest.current) setState({ error, loading: false, refreshing: false });
      }
    },
    [load],
  );

  useEffect(() => {
    run(false);
  }, [run]);

  const reload = useCallback(() => run(true), [run]);

  return { ...state, reload };
}
