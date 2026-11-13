import { gitlabDeviceFlow, isDefaultGitlabInstance } from '../api/gitlabAuth';
import { GITHUB_DEVICE_FLOW } from '../api/githubAuth';
import { DEFAULT_BASE_URL, saveOAuthCredentials } from '../storage/secure';
import { useProvider } from '../providers/ProviderContext';
import { useDeviceLogin } from './useDeviceLogin';

export function useProviderLogin(typedBaseUrl: string, onSignedIn: () => void) {
  const provider = useProvider();
  const isGithub = provider.id === 'github';
  // The built-in GitLab client ID exists only on the default instance, so that is the only one signed in to
  const baseUrl = isGithub ? provider.setup.defaultBaseUrl : DEFAULT_BASE_URL;
  const login = useDeviceLogin({
    flow: isGithub ? GITHUB_DEVICE_FLOW : gitlabDeviceFlow(baseUrl),
    baseUrl,
    saveToken: ({ accessToken, refreshToken }) =>
      saveOAuthCredentials(provider.id, { baseUrl, token: accessToken }, refreshToken),
    onSignedIn,
  });
  return { ...login, available: isGithub || isDefaultGitlabInstance(typedBaseUrl) };
}
