import { DarkTheme, DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { BranchScreen } from '../screens/BranchScreen';
import { BranchesScreen } from '../screens/BranchesScreen';
import { ProjectsScreen } from '../screens/ProjectsScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { SetupScreen } from '../screens/SetupScreen';
import { useTheme } from '../theme';

export type RootStackParamList = {
  Setup: undefined;
  Projects: undefined;
  Settings: undefined;
  Branches: { projectId: number; projectName: string };
  Branch: { projectId: number; projectName: string; branch: string };
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
        <Stack.Screen name="Projects" component={ProjectsScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
        <Stack.Screen name="Branches" component={BranchesScreen} />
        <Stack.Screen name="Branch" component={BranchScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
