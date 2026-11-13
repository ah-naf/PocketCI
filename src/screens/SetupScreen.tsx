import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import { View } from 'react-native';
import { AppText } from '../components/AppText';
import { Button } from '../components/Button';
import { ConnectionForm } from '../components/ConnectionForm';
import { ConnectionStatusBanner } from '../components/ConnectionStatusBanner';
import { GithubOrgHint } from '../components/GithubOrgHint';
import { LoginActions } from '../components/LoginActions';
import { ProviderSwitchSheet } from '../components/ProviderSwitchSheet';
import { Screen } from '../components/Screen';
import { SetupTopBar } from '../components/SetupTopBar';
import { useConnection } from '../hooks/useConnection';
import { useProviderLogin } from '../hooks/useProviderLogin';
import type { RootStackParamList } from '../navigation/RootNavigator';
import { useProvider, useProviderSwitch } from '../providers/ProviderContext';
import type { ProviderId } from '../providers/types';
import { useTheme } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Setup'>;

const LOGIN_ACCESS: Record<ProviderId, string> = { github: 'repo and workflow', gitlab: 'api' };
const UNAVAILABLE_MESSAGE = 'Sign-in with GitLab works only on the default instance for now. Use a token instead.';

export function SetupScreen({ navigation }: Props) {
  const { tw } = useTheme();
  const provider = useProvider();
  const { providers, switchTo } = useProviderSwitch();
  const connection = useConnection();
  const [switchOpen, setSwitchOpen] = useState(false);
  const [useToken, setUseToken] = useState(false);
  const login = useProviderLogin(connection.cleanedBaseUrl, () => navigation.replace('Projects'));
  const showLogin = !useToken;

  async function testAndContinue() {
    if (!(await connection.test())) return;
    await connection.save();
    navigation.replace('Projects');
  }

  return (
    <Screen scroll>
      <View style={tw`flex-1 px-4 pb-8`}>
        <SetupTopBar providerId={provider.id} providerName={provider.displayName} onSwitchProvider={() => setSwitchOpen(true)} />
        <View style={tw`gap-3 pb-7 pt-8`}>
          <AppText variant="display" style={tw`text-[34px] leading-[38px]`}>
            Connect your {provider.displayName}
          </AppText>
          <AppText variant="body" tone="muted">
            {showLogin
              ? `Sign in on ${provider.displayName}. PocketCI asks for ${LOGIN_ACCESS[provider.id]} access so it can read and run your pipelines. There is no token to copy.`
              : `Paste a ${provider.displayName} personal access token to get started. Nothing else works without it.`}
          </AppText>
        </View>
        {(!showLogin || provider.setup.editableBaseUrl) && (
          <ConnectionForm
            tokenless={showLogin}
            baseUrl={connection.baseUrl}
            token={connection.token}
            onChangeBaseUrl={connection.setBaseUrl}
            onChangeToken={connection.setToken}
            tokenInvalid={connection.status.kind === 'error'}
          />
        )}
        <View style={tw`mt-auto gap-3 pt-6`}>
          {showLogin ? (
            <LoginActions
              providerName={provider.displayName}
              state={login.state}
              onLogin={login.login}
              onCancel={login.cancel}
              onUseToken={() => setUseToken(true)}
              footer={provider.id === 'github' ? <GithubOrgHint /> : undefined}
              unavailable={login.available ? undefined : UNAVAILABLE_MESSAGE}
            />
          ) : (
            <>
              <ConnectionStatusBanner status={connection.status} />
              <Button
                variant="primary"
                label="Test and continue"
                onPress={testAndContinue}
                disabled={!connection.canSubmit}
                loading={connection.status.kind === 'testing'}
              />
              <Button variant="ghost" label={`Sign in with ${provider.displayName} instead`} onPress={() => setUseToken(false)} />
              <AppText variant="caption" style={tw`text-center`}>
                You can change both later in Settings.
              </AppText>
            </>
          )}
        </View>
      </View>
      <ProviderSwitchSheet
        visible={switchOpen}
        options={providers.map(({ id, displayName }) => ({ id, displayName }))}
        active={provider.id}
        onSelect={(id) => {
          setSwitchOpen(false);
          switchTo(id);
        }}
        onClose={() => setSwitchOpen(false)}
      />
    </Screen>
  );
}
