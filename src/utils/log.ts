const ANSI_PATTERN = /\u001b\[[0-9;?]*[ -/]*[@-~]/g;
const SECTION_PATTERN = /section_(?:start|end):\d+:\S*/g;

export const MAX_LOG_LINES = 2000;

export type LogKind = 'error' | 'warning' | 'success' | 'command' | 'plain';
export type LogLine = { number: number; text: string; kind: LogKind };

export function parseLog(raw: string): string[] {
  const lines = raw
    .replace(ANSI_PATTERN, '')
    .split('\n')
    .flatMap((line) => {
      const hadSection = line.includes('section_');
      const clean = line.replace(SECTION_PATTERN, '').replace(/\r+$/, '');
      const text = clean.slice(clean.lastIndexOf('\r') + 1);
      return hadSection && text.trim() === '' ? [] : [text];
    });
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
