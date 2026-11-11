import { parse } from 'yaml';
import { buildQuery, getJson, gitlabRequest } from './gitlabClient';

export type CiVariable = { key: string; value: string; options: string[]; description: string };

export type CiVariablesResult = {
  variables: CiVariable[];
  lintErrors: string[];
  usedFallback: boolean;
};

type LintResponse = { valid: boolean; errors: string[]; merged_yaml?: string };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function parseVariables(yamlText: string): CiVariable[] {
  const config: unknown = parse(yamlText);
  if (!isRecord(config) || !isRecord(config.variables)) return [];
  return Object.entries(config.variables).flatMap(([key, entry]) => {
    if (!isRecord(entry) || typeof entry.description !== 'string') return [];
    const options = Array.isArray(entry.options) ? entry.options.map(String) : [];
    const value = String(entry.value ?? options[0] ?? '');
    return [{ key, value, options, description: entry.description }];
  });
}

async function fetchFromLint(projectId: number, branch: string): Promise<CiVariablesResult | null> {
  const query = buildQuery({ content_ref: branch, dry_run: 'false' });
  const lint = await getJson<LintResponse>(`/projects/${projectId}/ci/lint${query}`);
  if (!lint.valid) return { variables: [], lintErrors: lint.errors, usedFallback: false };
  if (!lint.merged_yaml) return null;
  return { variables: parseVariables(lint.merged_yaml), lintErrors: [], usedFallback: false };
}

export async function fetchCiVariables(projectId: number, branch: string): Promise<CiVariablesResult> {
  try {
    const result = await fetchFromLint(projectId, branch);
    if (result) return result;
  } catch {
    // The lint endpoint can be unavailable; the raw file below is the documented fallback.
  }
  const file = encodeURIComponent('.gitlab-ci.yml');
  const { text } = await gitlabRequest(
    `/projects/${projectId}/repository/files/${file}/raw${buildQuery({ ref: branch })}`,
  );
  return { variables: parseVariables(text), lintErrors: [], usedFallback: true };
}
