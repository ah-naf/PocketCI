import { httpRequest } from './http';

const GITHUB_API = 'https://api.github.com';

export function githubRequest(path: string, token: string) {
  return httpRequest(`${GITHUB_API}${path}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
    },
  });
}

export async function fetchGithubLogin(token: string) {
  const { text } = await githubRequest('/user', token);
  return (JSON.parse(text) as { login: string }).login;
}
