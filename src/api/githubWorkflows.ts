import { parse } from 'yaml';
import type { RunInput, RunTarget } from '../providers/types';

type Dict = Record<string, unknown>;

const isRecord = (value: unknown): value is Dict =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

function readDispatch(on: unknown): { runnable: boolean; inputs: Dict } {
  if (on === 'workflow_dispatch') return { runnable: true, inputs: {} };
  if (Array.isArray(on)) return { runnable: on.includes('workflow_dispatch'), inputs: {} };
  if (isRecord(on) && 'workflow_dispatch' in on) {
    const dispatch = on.workflow_dispatch;
    return { runnable: true, inputs: isRecord(dispatch) && isRecord(dispatch.inputs) ? dispatch.inputs : {} };
  }
  return { runnable: false, inputs: {} };
}

function toRunInput(key: string, definition: unknown): RunInput {
  const config = isRecord(definition) ? definition : {};
  const label = typeof config.description === 'string' ? config.description : key;
  const given = config.default === undefined || config.default === null ? undefined : String(config.default);

  if (config.type === 'choice' && Array.isArray(config.options)) {
    const options = config.options.map(String);
    return { key, label, defaultValue: given ?? options[0] ?? '', options };
  }
  if (config.type === 'boolean') {
    return { key, label, defaultValue: given ?? 'false', options: ['true', 'false'] };
  }
  return { key, label, defaultValue: given ?? '', options: [] };
}

export function parseWorkflowTarget(path: string, yamlText: string): RunTarget {
  const fileName = path.split('/').pop() ?? path;
  try {
    const doc: unknown = parse(yamlText);
    if (!isRecord(doc)) throw new Error('not a mapping');
    const name = typeof doc.name === 'string' ? doc.name : fileName;
    const { runnable, inputs } = readDispatch(doc.on);
    return {
      id: fileName,
      name,
      runnable,
      reason: runnable ? undefined : 'No manual trigger',
      inputs: Object.entries(inputs).map(([key, definition]) => toRunInput(key, definition)),
    };
  } catch {
    return { id: fileName, name: fileName, runnable: false, reason: 'Could not read workflow', inputs: [] };
  }
}
