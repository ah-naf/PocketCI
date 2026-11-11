import { useMemo, useState } from 'react';
import type { LogLine } from '../utils/log';

export type LogNavigationMode = 'search' | 'error';

export function useLogNavigation(lines: LogLine[]) {
  const [query, setQueryText] = useState('');
  const [mode, setMode] = useState<LogNavigationMode>('search');
  const [index, setIndex] = useState(0);

  const needle = query.trim().toLowerCase();
  const matchLines = useMemo(
    () => (needle ? lines.filter((line) => line.text.toLowerCase().includes(needle)).map((line) => line.number) : []),
    [lines, needle],
  );
  const errorLines = useMemo(() => lines.filter((line) => line.kind === 'error').map((line) => line.number), [lines]);

  const targets = mode === 'search' ? matchLines : errorLines;
  const position = targets.length > 0 ? index % targets.length : 0;
  const highlighted = useMemo(() => new Set(mode === 'search' ? matchLines : []), [mode, matchLines]);

  const step = (delta: number) =>
    setIndex(targets.length > 0 ? (position + delta + targets.length) % targets.length : 0);

  function setQuery(text: string) {
    setQueryText(text);
    setMode('search');
    setIndex(0);
  }

  function jumpToError() {
    if (mode === 'error') {
      step(1);
      return;
    }
    setMode('error');
    setIndex(0);
  }

  function reset() {
    setQuery('');
  }

  return {
    query,
    setQuery,
    mode,
    count: targets.length,
    position: position + 1,
    errorCount: errorLines.length,
    focusLine: targets[position] as number | undefined,
    highlighted,
    next: () => step(1),
    previous: () => step(-1),
    jumpToError,
    reset,
  };
}
