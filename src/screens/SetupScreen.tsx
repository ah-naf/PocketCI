import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { View } from 'react-native';
import { AppText } from '../components/AppText';
import { Button } from '../components/Button';
import { ConnectionForm } from '../components/ConnectionForm';
import { ConnectionStatusBanner } from '../components/ConnectionStatusBanner';
import { Screen } from '../components/Screen';
import { useConnection } from '../hooks/useConnection';
import type { RootStackParamList } from '../navigation/RootNavigator';
import { useTheme } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Setup'>;

export function SetupScreen({ navigation }: Props) {
  const { tw } = useTheme();
  const connection = useConnection();

  async function testAndContinue() {
    if (!(await connection.test())) return;
    await connection.save();
    navigation.replace('Settings');
  }

  return (
    <Screen scroll>
      <View style={tw`flex-1 px-4 pb-8`}>
        <View style={tw`h-14 flex-row items-center justify-between`}>
          <AppText variant="small" mono tone="fg">
            pipeline
            <AppText variant="small" mono tone="accent">
              /
            </AppText>
            manager
          </AppText>
          <AppText variant="label">Setup</AppText>
        </View>
        <View style={tw`gap-3 pb-7 pt-8`}>
          <AppText variant="display" style={tw`text-[34px] leading-[38px]`}>
            Connect your GitLab
          </AppText>
          <AppText variant="body" tone="muted">
            This app talks to one self-hosted GitLab. Paste a personal access token to get started.
            Nothing else works without it.
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
    </Screen>
  );
}
