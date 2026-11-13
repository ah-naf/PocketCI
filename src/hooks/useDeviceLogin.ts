import { useEffect, useRef, useState } from 'react';
import { AppState, Linking } from 'react-native';
import { describeError, type FriendlyError } from '../api/errors';
import { DeviceFlowError, pollForToken, requestDeviceCode, type DeviceCode, type DeviceFlowConfig, type DeviceToken } from '../api/deviceFlow';
import { useProvider } from '../providers/ProviderContext';
import { queryClient } from '../providers/QueryProvider';
import { clearRecentProjects } from '../storage/recentProjects';

export type DeviceLoginState =
  | { kind: 'idle' }
  | { kind: 'requesting' }
  | { kind: 'waiting'; code: DeviceCode }
  | { kind: 'verifying' }
  | { kind: 'error'; error: FriendlyError };

function describeLoginError(error: unknown, providerName: string): FriendlyError {
  if (error instanceof DeviceFlowError) {
    return error.reason === 'expired'
      ? { title: 'Code expired', message: 'The code was not entered in time. Start again to get a new one.' }
      : { title: 'Access denied', message: `Sign-in was cancelled on ${providerName}. Start again to try once more.` };
  }
  return describeError(error, providerName);
}

type Options = {
  flow: DeviceFlowConfig;
  baseUrl: string;
  saveToken: (token: DeviceToken) => Promise<void>;
  onSignedIn: () => void;
};

export function useDeviceLogin({ flow, baseUrl, saveToken, onSignedIn }: Options) {
  const provider = useProvider();
  const [state, setState] = useState<DeviceLoginState>({ kind: 'idle' });
  const pendingCode = useRef<DeviceCode | null>(null);
  const controller = useRef<AbortController | null>(null);

  async function poll(code: DeviceCode) {
    controller.current?.abort();
    const current = new AbortController();
    controller.current = current;
    try {
      const token = await pollForToken(flow, code, current.signal);
      pendingCode.current = null;
      setState({ kind: 'verifying' });
      await provider.verifyCredentials({ baseUrl, token: token.accessToken, oauth: true });
      await saveToken(token);
      queryClient.clear();
      await clearRecentProjects(provider.id);
      onSignedIn();
    } catch (error) {
      if (current.signal.aborted) return;
      pendingCode.current = null;
      setState({ kind: 'error', error: describeLoginError(error, provider.displayName) });
    }
  }

  async function login() {
    controller.current?.abort();
    setState({ kind: 'requesting' });
    try {
      const code = await requestDeviceCode(flow);
      pendingCode.current = code;
      setState({ kind: 'waiting', code });
      Linking.openURL(code.verificationUri).catch(() => undefined);
      poll(code);
    } catch (error) {
      setState({ kind: 'error', error: describeLoginError(error, provider.displayName) });
    }
  }

  function cancel() {
    controller.current?.abort();
    pendingCode.current = null;
    setState({ kind: 'idle' });
  }

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (next) => {
      if (!pendingCode.current) return;
      if (next === 'active') poll(pendingCode.current);
      else controller.current?.abort();
    });
    return () => subscription.remove();
  });

  useEffect(() => () => controller.current?.abort(), []);

  return { state, login, cancel };
}
