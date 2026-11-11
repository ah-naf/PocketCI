export const ANSI_PATTERN = /\u001b\[[0-9;?]*[ -/]*[@-~]/g;
const SECTION_PATTERN = /section_(?:start|end):\d+:\S*/g;
const TIMESTAMP_PREFIX = /^\d{4}-\d{2}-\d{2}T[\d:.]+Z \d{2}[OE](\+?) ?/;

export const MAX_LOG_LINES = 2000;

export type LogKind = 'error' | 'warning' | 'success' | 'command' | 'plain';
export type LogLine = { number: number; text: string; kind: LogKind };

export function parseLog(raw: string): string[] {
  const lines: string[] = [];
  let canAppend = false;
  for (const rawLine of raw.replace(ANSI_PATTERN, '').split('\n')) {
    const prefix = TIMESTAMP_PREFIX.exec(rawLine);
    const body = prefix ? rawLine.slice(prefix[0].length) : rawLine;
    const clean = body.replace(SECTION_PATTERN, '').replace(/\r+$/, '');
    const text = clean.slice(clean.lastIndexOf('\r') + 1);
    if (body.includes('section_') && text.trim() === '') {
      canAppend = false;
      continue;
    }
    if (prefix?.[1] === '+' && canAppend) lines[lines.length - 1] += text;
    else lines.push(text);
    canAppend = true;
  }
  if (lines[lines.length - 1] === '') lines.pop();
  return lines;
}

function classifyLine(text: string): LogKind {
  if (text.startsWith('$ ')) return 'command';
  if (/\b(error|fatal|fail(ed|ure)?|exception)\b/i.test(text)) return 'error';
  if (/\bwarn(ing)?\b/i.test(text)) return 'warning';
  if (/\b(passed|success(fully)?)\b/i.test(text) || text.startsWith('PASS')) return 'success';
  return 'plain';
}

export function toLogLines(lines: string[], skip: number): LogLine[] {
  return lines.slice(skip).map((text, index) => ({
    number: skip + index + 1,
    text,
    kind: classifyLine(text),
  }));
}
