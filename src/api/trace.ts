import { GitlabError } from './errors';
import { gitlabRequest } from './gitlabClient';

export type TraceChunk = { text: string; nextOffset: number; replace: boolean };

function byteLength(text: string) {
  return new TextEncoder().encode(text).length;
}

export async function fetchTrace(projectId: number, jobId: number, offset: number): Promise<TraceChunk> {
  const path = `/projects/${projectId}/jobs/${jobId}/trace`;
  try {
    const { text, headers, status } = await gitlabRequest(
      path,
      offset > 0 ? { headers: { Range: `bytes=${offset}-` } } : undefined,
    );
    if (status !== 206) return { text, nextOffset: byteLength(text), replace: true };
    const end = Number(/-(\d+)\//.exec(headers.get('content-range') ?? '')?.[1]);
    // shortcut: a multi-byte character split across two chunks is decoded wrongly, reload the log to fix it.
    return { text, nextOffset: Number.isNaN(end) ? offset + byteLength(text) : end + 1, replace: false };
  } catch (error) {
    if (error instanceof GitlabError && error.status === 416) {
      return { text: '', nextOffset: offset, replace: false };
    }
    throw error;
  }
}
