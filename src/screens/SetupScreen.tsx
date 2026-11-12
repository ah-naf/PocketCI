import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import { View } from 'react-native';
import { AppText } from '../components/AppText';
import { Button } from '../components/Button';
import { ConnectionForm } from '../components/ConnectionForm';
import { ConnectionStatusBanner } from '../components/ConnectionStatusBanner';
import { ProviderPill } from '../components/ProviderPill';
import { ProviderSwitchSheet } from '../components/ProviderSwitchSheet';
import { Screen } from '../components/Screen';
import { useConnection } from '../hooks/useConnection';
import type { RootStackParamList } from '../navigation/RootNavigator';
import { useProvider, useProviderSwitch } from '../providers/ProviderContext';
import { useTheme } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Setup'>;

export function SetupScreen({ navigation }: Props) {
  const { tw } = useTheme();
  const provider = useProvider();
  const { providers, switchTo } = useProviderSwitch();
  const connection = useConnection();
  const [switchOpen, setSwitchOpen] = useState(false);

  async function testAndContinue() {
    if (!(await connection.test())) return;
    await connection.save();
    navigation.replace('Projects');
  }

  return (
    <Screen scroll>
      <View style={tw`flex-1 px-4 pb-8`}>
        <View style={tw`h-14 flex-row items-center justify-between`}>
          <AppText variant="small" mono tone="fg">
            pocket
            <AppText variant="small" mono tone="accent">
              /
            </AppText>
            ci
          </AppText>
          <ProviderPill providerId={provider.id} label={provider.displayName} onPress={() => setSwitchOpen(true)} />
        </View>
        <View style={tw`gap-3 pb-7 pt-8`}>
          <AppText variant="display" style={tw`text-[34px] leading-[38px]`}>
            Connect your {provider.displayName}
          </AppText>
          <AppText variant="body" tone="muted">
            Paste a {provider.displayName} personal access token to get started. Nothing else works
            without it.
          </AppText>
        </View>
        <ConnectionForm
          baseUrl={connection.baseUrl}
          token={connection.token}
          onChangeBaseUrl={connection.setBaseUrl}
          onChangeToken={connection.setToken}
          tokenInvalid={connection.status.kind === 'error'}
        />
        <View style={tw`mt-auto gap-3 pt-6`}>
          <ConnectionStatusBanner status={connection.status} />
          <Button
            variant="primary"
            label="Test and continue"
            onPress={testAndContinue}
            disabled={!connection.canSubmit}
            loading={connection.status.kind === 'testing'}
          />
          <AppText variant="caption" style={tw`text-center`}>
            You can change both later in Settings.
          </AppText>
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
