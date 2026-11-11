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
import { loadSettings } from './src/storage/secure';
import { loadThemePreference } from './src/storage/themePreference';

export default function App() {
  const [fontsLoaded] = useFonts({
    InterTight_400Regular,
    InterTight_500Medium,
    InterTight_600SemiBold,
    JetBrainsMono_400Regular,
    JetBrainsMono_500Medium,
  });
  const [hasToken, setHasToken] = useState<boolean | null>(null);

  useEffect(() => {
    Promise.all([loadSettings(), loadThemePreference()]).then(
      ([{ token }, theme]) => {
        Appearance.setColorScheme(theme ?? 'unspecified');
        setHasToken(token !== '');
      },
      () => setHasToken(false),
    );
  }, []);

  if (!fontsLoaded || hasToken === null) return null;

  return (
    <SafeAreaProvider>
      <RootNavigator initialRouteName={hasToken ? 'Projects' : 'Setup'} />
      <StatusBar style="auto" />
    </SafeAreaProvider>
  );
}
