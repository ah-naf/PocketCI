import { useEffect, useRef } from 'react';

export function usePoll(callback: () => void, intervalMs: number, enabled: boolean) {
  const latestCallback = useRef(callback);
  latestCallback.current = callback;

  useEffect(() => {
    if (!enabled) return;
    const timer = setInterval(() => latestCallback.current(), intervalMs);
    return () => clearInterval(timer);
  }, [intervalMs, enabled]);
}
