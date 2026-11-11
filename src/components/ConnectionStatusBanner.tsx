import type { ConnectionStatus } from '../hooks/useConnection';
import { Banner } from './Banner';

export function ConnectionStatusBanner({ status }: { status: ConnectionStatus }) {
  switch (status.kind) {
    case 'ok':
      return <Banner variant="success" title="Connected" message={`Signed in as @${status.username}`} />;
    case 'saved':
      return <Banner variant="success" title="Saved" message="The token is stored securely on this device." />;
    case 'error':
      return <Banner variant="failed" {...status.error} />;
    default:
      return null;
  }
}
