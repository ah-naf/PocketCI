import type { Credentials } from '../providers/types';
import { getJson } from './gitlabClient';

export type GitlabUser = { username: string };

export function fetchCurrentUser(auth?: Credentials) {
  return getJson<GitlabUser>('/user', { auth });
}
