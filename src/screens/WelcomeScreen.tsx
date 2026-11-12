import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { View } from 'react-native';
import { AppText } from '../components/AppText';
import { Icon } from '../components/Icon';
import { ListRow } from '../components/ListRow';
import { Logo } from '../components/Logo';
import { Screen } from '../components/Screen';
import { SectionHeader } from '../components/SectionHeader';
import type { RootStackParamList } from '../navigation/RootNavigator';
import { useProviderSwitch } from '../providers/ProviderContext';
import type { ProviderId } from '../providers/types';
import { useTheme } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Welcome'>;

const FEATURES = [
  'Run pipelines with your own variables',
  'Watch jobs and read live logs',
  'Retry, cancel and download artifacts',
];

export function WelcomeScreen({ navigation }: Props) {
  const { tw } = useTheme();
  const { providers, switchTo } = useProviderSwitch();

  async function selectProvider(id: ProviderId) {
    await switchTo(id);
    navigation.navigate('Setup');
  }

  return (
    <Screen scroll>
      <View style={tw`px-4 pb-8`}>
        <View style={tw`items-center gap-2.5 pt-6`}>
          <Logo width={132} />
          <AppText variant="small" mono tone="fg">
            pocket
            <AppText variant="small" mono tone="accent">
              /
            </AppText>
            ci
          </AppText>
        </View>
        <View style={tw`gap-3 pb-6 pt-8`}>
          <AppText variant="display" style={tw`text-[34px] leading-[38px]`}>
            Your pipelines, in your pocket
          </AppText>
          <AppText variant="body" tone="muted">
            PocketCI is a small client for GitLab and GitHub. It talks to their APIs directly, with no server of its own.
          </AppText>
        </View>
        <View style={tw`gap-2.5 pb-4`}>
          {FEATURES.map((feature) => (
            <View key={feature} style={tw`flex-row items-center gap-2.5`}>
              <Icon name="check" color="accent" size={18} />
              <AppText variant="body">{feature}</AppText>
            </View>
          ))}
        </View>
      </View>
      <SectionHeader title="Choose your provider" bordered />
      {providers.map(({ id, displayName }) => (
        <ListRow key={id} title={displayName} onPress={() => selectProvider(id)} />
      ))}
      <View style={tw`mx-4 mt-6 flex-row gap-3 rounded-2xl border border-line bg-card p-4`}>
        <Icon name="info" color="accent" />
        <View style={tw`min-w-0 flex-1 gap-1`}>
          <AppText variant="title">We do not store your token</AppText>
          <AppText variant="small" tone="muted">
            PocketCI has no backend. Your token stays on this phone in the secure keystore. It is sent only to GitLab or GitHub, never to us. Remove it any time in Settings.
          </AppText>
        </View>
      </View>
    </Screen>
  );
}
