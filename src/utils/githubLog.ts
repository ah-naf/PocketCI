import { ANSI_PATTERN } from './log';

const TIMESTAMP_PREFIX = /^﻿?\d{4}-\d{2}-\d{2}T[\d:.]+Z ?/;

export function cleanGithubLog(raw: string): string[] {
  const lines = raw
    .replace(ANSI_PATTERN, '')
    .split('\n')
    .flatMap((line) => {
      const text = line.replace(/\r+$/, '').replace(TIMESTAMP_PREFIX, '');
      if (text.startsWith('##[endgroup]') || text.startsWith('##[debug]')) return [];
      if (text.startsWith('##[group]')) return [`▸ ${text.slice('##[group]'.length)}`];
      if (text.startsWith('##[command]')) return [`$ ${text.slice('##[command]'.length)}`];
      if (text.startsWith('##[error]')) return [`Error: ${text.slice('##[error]'.length)}`];
      if (text.startsWith('##[warning]')) return [`Warning: ${text.slice('##[warning]'.length)}`];
      return [text];
    });
  if (lines[lines.length - 1] === '') lines.pop();
  return lines;
}
