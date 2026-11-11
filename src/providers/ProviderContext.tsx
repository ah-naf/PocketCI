import { createContext, useContext, type ReactNode } from 'react';
import type { CiProvider } from './CiProvider';
import { GitlabProvider } from './GitlabProvider';

const gitlab = new GitlabProvider();

const ProviderContext = createContext<CiProvider>(gitlab);

export function ProviderRoot({ children }: { children: ReactNode }) {
  return <ProviderContext.Provider value={gitlab}>{children}</ProviderContext.Provider>;
}

export function useProvider() {
  return useContext(ProviderContext);
}
