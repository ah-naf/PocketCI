import type { Settings } from '../storage/secure';
import { getJson } from './gitlabClient';

export type GitlabUser = { username: string };

export function fetchCurrentUser(auth?: Settings) {
  return getJson<GitlabUser>('/user', { auth });
}
