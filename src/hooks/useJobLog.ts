import { useCallback, useEffect, useRef, useState } from 'react';
import { useProvider } from '../providers/ProviderContext';
import type { ProjectRef } from '../providers/types';

export function useJobLog(project: ProjectRef, jobId: string) {
  const provider = useProvider();
  const [text, setText] = useState('');
  const [status, setStatus] = useState<{ loading: boolean; error?: unknown }>({ loading: true });
  const cursor = useRef<string | null>(null);
  const inFlight = useRef(false);

  const fetchNext = useCallback(
    async (fromStart = false) => {
      if (inFlight.current) return;
      inFlight.current = true;
      if (fromStart) cursor.current = null;
      try {
        const chunk = await provider.readLog(project, jobId, cursor.current);
        cursor.current = chunk.cursor;
        setText((current) => (chunk.replace ? chunk.text : current + chunk.text));
        setStatus({ loading: false });
      } catch (error) {
        setStatus({ loading: false, error });
      } finally {
        inFlight.current = false;
      }
    },
    [provider, project, jobId],
  );

  useEffect(() => {
    fetchNext();
  }, [fetchNext]);

  const poll = useCallback(() => fetchNext(), [fetchNext]);
  const reload = useCallback(() => fetchNext(true), [fetchNext]);

  return { text, ...status, poll, reload };
}
