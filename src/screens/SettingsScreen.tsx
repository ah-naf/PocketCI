import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Alert, View } from 'react-native';
import { AppText } from '../components/AppText';
import { Avatar } from '../components/Avatar';
import { Button } from '../components/Button';
import { ConnectionForm } from '../components/ConnectionForm';
import { ConnectionStatusBanner } from '../components/ConnectionStatusBanner';
import { Screen } from '../components/Screen';
import { useConnection } from '../hooks/useConnection';
import type { RootStackParamList } from '../navigation/RootNavigator';
import { useProvider } from '../providers/ProviderContext';
import { queryClient } from '../providers/QueryProvider';
import { clearRecentProjects } from '../storage/recentProjects';
import { deleteToken } from '../storage/secure';
import { useTheme } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Settings'>;

export function SettingsScreen({ navigation }: Props) {
  const { tw } = useTheme();
  const provider = useProvider();
  const connection = useConnection();

  function confirmRemoveToken() {
    Alert.alert(`Remove ${provider.displayName} token?`, 'The token is deleted from this device. Recent projects stay.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          await deleteToken(provider.id);
          queryClient.clear();
          await clearRecentProjects(provider.id);
          navigation.reset({ index: 0, routes: [{ name: 'Setup' }] });
        },
      },
    ]);
  }

  return (
    <Screen
      title="Settings"
      subtitle={provider.displayName}
      onBack={navigation.canGoBack() ? navigation.goBack : undefined}
      scroll
    >
      <View style={tw`flex-1`}>
        <View style={tw`gap-4 px-4`}>
          {connection.account && (
            <View style={tw`mt-5 flex-row items-center gap-3 rounded-2xl border border-line bg-card p-3`}>
              <Avatar
                uri={connection.account.avatarUrl}
                name={connection.account.name ?? connection.account.username}
                size={44}
              />
              <View style={tw`min-w-0 flex-1`}>
                <AppText variant="title" numberOfLines={1}>
                  {connection.account.name ?? connection.account.username}
                </AppText>
                <AppText variant="small" mono numberOfLines={1} style={tw`text-xs`}>
                  @{connection.account.username} · {provider.displayName}
                </AppText>
              </View>
            </View>
          )}
          <AppText variant="label" style={connection.account ? undefined : tw`pt-5`}>
            Connection
          </AppText>
          <ConnectionForm
            baseUrl={connection.baseUrl}
            token={connection.token}
            onChangeBaseUrl={connection.setBaseUrl}
            onChangeToken={connection.setToken}
            tokenInvalid={connection.status.kind === 'error'}
          />
          <View style={tw`mt-1 flex-row gap-3`}>
            <Button
              variant="ghost"
              label="Test connection"
              onPress={connection.test}
              disabled={!connection.canSubmit}
              loading={connection.status.kind === 'testing'}
              style={tw`flex-1`}
            />
            <Button
              variant="primary"
              label="Save"
              onPress={connection.save}
              disabled={!connection.canSubmit}
              style={tw`flex-1`}
            />
          </View>
          <ConnectionStatusBanner status={connection.status} />
        </View>
        <View style={tw`mt-auto gap-2.5 border-t border-line px-4 pb-8 pt-4`}>
          <AppText variant="label">Danger zone</AppText>
          <Button variant="danger" label="Remove token" onPress={confirmRemoveToken} />
          <AppText variant="caption">Deletes the {provider.displayName} token from this device.</AppText>
        </View>
      </View>
    </Screen>
  );
}
