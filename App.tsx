import { InterTight_400Regular } from '@expo-google-fonts/inter-tight/400Regular';
import { InterTight_500Medium } from '@expo-google-fonts/inter-tight/500Medium';
import { InterTight_600SemiBold } from '@expo-google-fonts/inter-tight/600SemiBold';
import { JetBrainsMono_400Regular } from '@expo-google-fonts/jetbrains-mono/400Regular';
import { JetBrainsMono_500Medium } from '@expo-google-fonts/jetbrains-mono/500Medium';
import { useFonts } from 'expo-font';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { Appearance } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { RootNavigator } from './src/navigation/RootNavigator';
import { ProviderRoot, useProvider } from './src/providers/ProviderContext';
import { QueryProvider } from './src/providers/QueryProvider';
import { loadCredentials } from './src/storage/secure';
import { loadThemePreference } from './src/storage/themePreference';

function AppContent() {
  const provider = useProvider();
  const [hasToken, setHasToken] = useState<boolean | null>(null);

  useEffect(() => {
    loadCredentials(provider.id, provider.setup.defaultBaseUrl).then(
      ({ token }) => setHasToken(token !== ''),
      () => setHasToken(false),
    );
    // Only the provider active at launch decides the first screen; later switches navigate themselves.
  }, []);

  if (hasToken === null) return null;

  return (
    <>
      <RootNavigator initialRouteName={hasToken ? 'Projects' : 'Welcome'} />
      <StatusBar style="auto" />
    </>
  );
}

export default function App() {
  const [fontsLoaded] = useFonts({
    InterTight_400Regular,
    InterTight_500Medium,
    InterTight_600SemiBold,
    JetBrainsMono_400Regular,
    JetBrainsMono_500Medium,
  });
  const [themeReady, setThemeReady] = useState(false);

  useEffect(() => {
    loadThemePreference().then((theme) => {
      Appearance.setColorScheme(theme ?? 'unspecified');
      setThemeReady(true);
    });
  }, []);

  if (!fontsLoaded || !themeReady) return null;

  return (
    <SafeAreaProvider>
      <QueryProvider>
        <ProviderRoot>
          <AppContent />
        </ProviderRoot>
      </QueryProvider>
    </SafeAreaProvider>
  );
}
