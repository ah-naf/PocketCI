import { DarkTheme, DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SettingsScreen } from '../screens/SettingsScreen';
import { SetupScreen } from '../screens/SetupScreen';
import { useTheme } from '../theme';

export type RootStackParamList = {
  Setup: undefined;
  Settings: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator({ initialRouteName }: { initialRouteName: keyof RootStackParamList }) {
  const { colors, scheme } = useTheme();
  const base = scheme === 'dark' ? DarkTheme : DefaultTheme;
  const theme = {
    ...base,
    colors: {
      ...base.colors,
      background: colors.bg,
      card: colors.bg,
      text: colors.fg,
      border: colors.line,
      primary: colors.accent,
    },
  };

  return (
    <NavigationContainer theme={theme}>
      <Stack.Navigator initialRouteName={initialRouteName} screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Setup" component={SetupScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
