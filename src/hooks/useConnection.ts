import { useEffect, useState } from 'react';
import { describeError, type FriendlyError } from '../api/errors';
import { fetchCurrentUser } from '../api/user';
import { DEFAULT_BASE_URL, loadSettings, saveSettings } from '../storage/secure';

export type ConnectionStatus =
  | { kind: 'idle' }
  | { kind: 'testing' }
  | { kind: 'saved' }
  | { kind: 'ok'; username: string }
  | { kind: 'error'; error: FriendlyError };

export function useConnection() {
  const [baseUrl, setBaseUrl] = useState(DEFAULT_BASE_URL);
  const [token, setToken] = useState('');
  const [status, setStatus] = useState<ConnectionStatus>({ kind: 'idle' });

  useEffect(() => {
    loadSettings().then((settings) => {
      setBaseUrl(settings.baseUrl);
      setToken(settings.token);
    });
  }, []);

  const cleaned = { baseUrl: baseUrl.trim().replace(/\/+$/, ''), token: token.trim() };

  async function test() {
    setStatus({ kind: 'testing' });
    try {
      const user = await fetchCurrentUser(cleaned);
      setStatus({ kind: 'ok', username: user.username });
      return true;
    } catch (error) {
      setStatus({ kind: 'error', error: describeError(error) });
      return false;
    }
  }

  async function save() {
    await saveSettings(cleaned);
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
