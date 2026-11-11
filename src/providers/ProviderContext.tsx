import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { loadActiveProvider, saveActiveProvider } from '../storage/activeProvider';
import { loadCredentials } from '../storage/secure';
import type { CiProvider } from './CiProvider';
import { GithubProvider } from './GithubProvider';
import { GitlabProvider } from './GitlabProvider';
import type { ProviderId } from './types';

const providers: Record<ProviderId, CiProvider> = {
  gitlab: new GitlabProvider(),
  github: new GithubProvider(),
};

type ProviderState = {
  active: ProviderId;
  providers: CiProvider[];
  switchTo: (id: ProviderId) => Promise<boolean>;
};

const ProviderContext = createContext<ProviderState | null>(null);

export function ProviderRoot({ children }: { children: ReactNode }) {
  const [active, setActive] = useState<ProviderId | null>(null);

  useEffect(() => {
    loadActiveProvider().then(setActive);
  }, []);

  const switchTo = useCallback(async (id: ProviderId) => {
    await saveActiveProvider(id);
    setActive(id);
    const { token } = await loadCredentials(id, providers[id].setup.defaultBaseUrl);
    return token !== '';
  }, []);

  const value = useMemo(
    () => (active ? { active, providers: Object.values(providers), switchTo } : null),
    [active, switchTo],
  );

  if (!value) return null;
  return <ProviderContext.Provider value={value}>{children}</ProviderContext.Provider>;
}

function useProviderState() {
  const state = useContext(ProviderContext);
  if (!state) throw new Error('useProvider must be used inside ProviderRoot');
  return state;
}

export function useProvider() {
  const { active } = useProviderState();
  return providers[active];
}

export function useProviderSwitch() {
  return useProviderState();
}
