import { useEffect, useState } from 'react';
import { describeError, type FriendlyError } from '../api/errors';
import { useProvider } from '../providers/ProviderContext';
import { queryClient } from '../providers/QueryProvider';
import type { Account } from '../providers/types';
import { clearRecentProjects } from '../storage/recentProjects';
import { loadCredentials, saveCredentials } from '../storage/secure';

export type ConnectionStatus =
  | { kind: 'idle' }
  | { kind: 'testing' }
  | { kind: 'saved' }
  | { kind: 'ok'; username: string }
  | { kind: 'error'; error: FriendlyError };

export function useConnection() {
  const provider = useProvider();
  const { defaultBaseUrl, editableBaseUrl } = provider.setup;
  const [baseUrl, setBaseUrl] = useState(defaultBaseUrl);
  const [token, setToken] = useState('');
  const [status, setStatus] = useState<ConnectionStatus>({ kind: 'idle' });
  const [account, setAccount] = useState<Account | null>(null);

  useEffect(() => {
    setAccount(null);
    setStatus({ kind: 'idle' });
    loadCredentials(provider.id, defaultBaseUrl).then((credentials) => {
      setBaseUrl(credentials.baseUrl);
      setToken(credentials.token);
      if (credentials.token) provider.verifyCredentials(credentials).then(setAccount, () => undefined);
    });
  }, [provider, defaultBaseUrl]);

  const cleaned = {
    baseUrl: editableBaseUrl ? baseUrl.trim().replace(/\/+$/, '') : defaultBaseUrl,
    token: token.trim(),
  };

  async function test() {
    setStatus({ kind: 'testing' });
    try {
      const verified = await provider.verifyCredentials(cleaned);
      setAccount(verified);
      setStatus({ kind: 'ok', username: verified.username });
      return true;
    } catch (error) {
      setStatus({ kind: 'error', error: describeError(error, provider.displayName) });
      return false;
    }
  }

  async function save() {
    const previous = await loadCredentials(provider.id, defaultBaseUrl);
    await saveCredentials(provider.id, cleaned);
    queryClient.clear();
    if (previous.token !== cleaned.token || previous.baseUrl !== cleaned.baseUrl) {
      await clearRecentProjects(provider.id);
    }
    setStatus({ kind: 'saved' });
  }

  return {
    account,
    baseUrl,
    cleanedBaseUrl: cleaned.baseUrl,
    setBaseUrl,
    token,
    setToken,
    status,
    canSubmit: cleaned.token !== '' && cleaned.baseUrl !== '' && status.kind !== 'testing',
    test,
    save,
  };
}
