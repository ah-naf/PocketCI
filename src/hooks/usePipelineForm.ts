import { useRef, useState } from 'react';
import type { RunInput } from '../providers/types';

const KEY_PATTERN = /^[A-Za-z_][A-Za-z0-9_]*$/;
const KEY_ERROR = "Keys use letters, digits and underscores only, and can't start with a digit.";

export type CustomVariable = { id: number; key: string; value: string };
export type VariableEntry = { key: string; value: string };

export function usePipelineForm(variables: RunInput[] | undefined) {
  const [edits, setEdits] = useState<Record<string, string>>({});
  const [customRows, setCustomRows] = useState<CustomVariable[]>([]);
  const nextId = useRef(1);

  const setValue = (key: string, value: string) => setEdits((current) => ({ ...current, [key]: value }));

  const addCustom = () => setCustomRows((rows) => [...rows, { id: nextId.current++, key: '', value: '' }]);

  const updateCustom = (id: number, patch: Partial<Omit<CustomVariable, 'id'>>) =>
    setCustomRows((rows) => rows.map((row) => (row.id === id ? { ...row, ...patch } : row)));

  const removeCustom = (id: number) => setCustomRows((rows) => rows.filter((row) => row.id !== id));

  const filledRows = customRows.filter((row) => row.key.trim() !== '' || row.value !== '');
  const customErrors: Record<number, string> = {};
  for (const row of filledRows) {
    if (!KEY_PATTERN.test(row.key.trim())) customErrors[row.id] = KEY_ERROR;
  }

  const entries: VariableEntry[] = [
    ...(variables ?? []).map(({ key, defaultValue }) => ({ key, value: edits[key] ?? defaultValue })),
    ...filledRows.map((row) => ({ key: row.key.trim(), value: row.value })),
  ];

  return {
    edits,
    setValue,
    customRows,
    addCustom,
    updateCustom,
    removeCustom,
    customErrors,
    entries,
    canRun: Object.keys(customErrors).length === 0,
  };
}
