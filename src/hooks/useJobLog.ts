import { useCallback, useEffect, useRef, useState } from 'react';
import { fetchTrace } from '../api/trace';

export function useJobLog(projectId: number, jobId: number) {
  const [text, setText] = useState('');
  const [status, setStatus] = useState<{ loading: boolean; error?: unknown }>({ loading: true });
  const offset = useRef(0);
  const inFlight = useRef(false);

  const fetchNext = useCallback(
    async (fromStart = false) => {
      if (inFlight.current) return;
      inFlight.current = true;
      if (fromStart) offset.current = 0;
      try {
        const chunk = await fetchTrace(projectId, jobId, offset.current);
        offset.current = chunk.nextOffset;
        setText((current) => (chunk.replace ? chunk.text : current + chunk.text));
        setStatus({ loading: false });
      } catch (error) {
        setStatus({ loading: false, error });
      } finally {
        inFlight.current = false;
      }
    },
    [projectId, jobId],
  );

  useEffect(() => {
    fetchNext();
  }, [fetchNext]);

  const poll = useCallback(() => fetchNext(), [fetchNext]);
  const reload = useCallback(() => fetchNext(true), [fetchNext]);

  return { text, ...status, poll, reload };
}
