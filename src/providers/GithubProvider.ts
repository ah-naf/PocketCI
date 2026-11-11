import { fetchGithubLogin } from '../api/githubClient';
import { CiProvider } from './CiProvider';
import type { Credentials } from './types';

const notImplemented = () => Promise.reject(new Error('Not implemented yet'));

export class GithubProvider extends CiProvider {
  readonly id = 'github';
  readonly displayName = 'GitHub';
  readonly labels = {
    projects: 'Repositories',
    project: 'repository',
    run: 'workflow run',
    runs: 'workflow runs',
  };
  readonly capabilities = { cancelJob: false, liveLogs: false };
  readonly setup = {
    editableBaseUrl: false,
    defaultBaseUrl: 'https://api.github.com',
    tokenHint:
      'Use a classic token with the repo and workflow scopes. Create one in GitHub under Settings → Developer settings → Personal access tokens.',
  };

  verifyCredentials({ token }: Credentials) {
    return fetchGithubLogin(token);
  }

  listProjects() {
    return notImplemented();
  }
  getDefaultBranch() {
    return notImplemented();
  }
  listBranches() {
    return notImplemented();
  }
  getRunOptions() {
    return notImplemented();
  }
  startRun() {
    return notImplemented();
  }
  listRuns() {
    return notImplemented();
  }
  getRun() {
    return notImplemented();
  }
  listJobs() {
    return notImplemented();
  }
  getJob() {
    return notImplemented();
  }
  readLog() {
    return notImplemented();
  }
  cancelRun() {
    return notImplemented();
  }

  cleanLog(raw: string) {
    return raw.split('\n');
  }
}
