import { Linking, View } from 'react-native';
import { GITHUB_CLIENT_ID } from '../api/githubAuth';
import type { GithubLoginState } from '../hooks/useGithubLogin';
import { useTheme } from '../theme';
import { AppText } from './AppText';
import { Banner } from './Banner';
import { Button } from './Button';
import { DeviceCodeCard } from './DeviceCodeCard';

const ORG_ACCESS_URL = `https://github.com/settings/connections/applications/${GITHUB_CLIENT_ID}`;

type Props = {
  state: GithubLoginState;
  onLogin: () => void;
  onCancel: () => void;
  onUseToken: () => void;
};

export function GithubLoginActions({ state, onLogin, onCancel, onUseToken }: Props) {
  const { tw } = useTheme();
  if (state.kind === 'waiting') {
    return <DeviceCodeCard code={state.code.userCode} verificationUri={state.code.verificationUri} onCancel={onCancel} />;
  }
  const busy = state.kind === 'requesting' || state.kind === 'verifying';
  return (
    <View style={tw`gap-3`}>
      {state.kind === 'error' && <Banner variant="failed" {...state.error} />}
      <Button
        variant="primary"
        label={state.kind === 'verifying' ? 'Signing in' : 'Continue with GitHub'}
        onPress={onLogin}
        loading={busy}
      />
      <Button variant="ghost" label="Use a token instead" onPress={onUseToken} disabled={busy} />
      <AppText variant="caption" style={tw`text-center`}>
        Missing org repos? Ask the org owner to approve PocketCI.{' '}
        <AppText variant="caption" tone="accent" onPress={() => Linking.openURL(ORG_ACCESS_URL).catch(() => undefined)}>
          Check access
        </AppText>
      </AppText>
    </View>
  );
}
