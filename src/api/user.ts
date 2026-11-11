import type { Credentials } from '../providers/types';
import { getJson } from './gitlabClient';

export type GitlabUser = { username: string; name: string | null; avatar_url: string | null };

export function fetchCurrentUser(auth?: Credentials) {
  return getJson<GitlabUser>('/user', { auth });
}
