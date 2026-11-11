import { useEffect, useState } from 'react';
import { describeError, type FriendlyError } from '../api/errors';
import { useProvider } from '../providers/ProviderContext';
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

  useEffect(() => {
    loadCredentials(provider.id, defaultBaseUrl).then((credentials) => {
      setBaseUrl(credentials.baseUrl);
      setToken(credentials.token);
    });
  }, [provider, defaultBaseUrl]);

  const cleaned = {
    baseUrl: editableBaseUrl ? baseUrl.trim().replace(/\/+$/, '') : defaultBaseUrl,
    token: token.trim(),
  };

  async function test() {
    setStatus({ kind: 'testing' });
    try {
      const username = await provider.verifyCredentials(cleaned);
      setStatus({ kind: 'ok', username });
      return true;
    } catch (error) {
      setStatus({ kind: 'error', error: describeError(error, provider.displayName) });
      return false;
    }
  }

  async function save() {
    await saveCredentials(provider.id, cleaned);
    setStatus({ kind: 'saved' });
  }

  return {
    baseUrl,
    setBaseUrl,
    token,
    setToken,
    status,
    canSubmit: cleaned.token !== '' && cleaned.baseUrl !== '' && status.kind !== 'testing',
    test,
    save,
  };
}
