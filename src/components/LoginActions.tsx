import type { ReactNode } from 'react';
import { View } from 'react-native';
import type { DeviceLoginState } from '../hooks/useDeviceLogin';
import { useTheme } from '../theme';
import { Banner } from './Banner';
import { Button } from './Button';
import { DeviceCodeCard } from './DeviceCodeCard';

type Props = {
  providerName: string;
  state: DeviceLoginState;
  onLogin: () => void;
  onCancel: () => void;
  onUseToken: () => void;
  footer?: ReactNode;
};

export function LoginActions({ providerName, state, onLogin, onCancel, onUseToken, footer }: Props) {
  const { tw } = useTheme();
  if (state.kind === 'waiting') {
    return (
      <DeviceCodeCard
        providerName={providerName}
        code={state.code.userCode}
        verificationUri={state.code.verificationUri}
        onCancel={onCancel}
      />
    );
  }
  const busy = state.kind === 'requesting' || state.kind === 'verifying';
  return (
    <View style={tw`gap-3`}>
      {state.kind === 'error' && <Banner variant="failed" {...state.error} />}
      <Button
        variant="primary"
        label={state.kind === 'verifying' ? 'Signing in' : `Continue with ${providerName}`}
        onPress={onLogin}
        loading={busy}
      />
      <Button variant="ghost" label="Use a token instead" onPress={onUseToken} disabled={busy} />
      {footer}
    </View>
  );
}
