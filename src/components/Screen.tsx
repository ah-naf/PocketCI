import type { ReactElement, ReactNode } from 'react';
import { ScrollView, View, type RefreshControlProps } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../theme';
import { Header } from './Header';

type Props = {
  title?: string;
  subtitle?: ReactNode;
  monoTitle?: boolean;
  headerRight?: ReactNode;
  onBack?: () => void;
  scroll?: boolean;
  refreshControl?: ReactElement<RefreshControlProps>;
  children: ReactNode;
};

export function Screen({ title, subtitle, monoTitle, headerRight, onBack, scroll, refreshControl, children }: Props) {
  const { tw } = useTheme();
  return (
    <SafeAreaView style={tw`flex-1 bg-bg`}>
      {title && <Header title={title} subtitle={subtitle} monoTitle={monoTitle} right={headerRight} onBack={onBack} />}
      {scroll ? (
        <ScrollView
          contentContainerStyle={tw`grow`}
          keyboardShouldPersistTaps="handled"
          automaticallyAdjustKeyboardInsets
          refreshControl={refreshControl}
        >
          {children}
        </ScrollView>
      ) : (
        <View style={tw`flex-1`}>{children}</View>
      )}
    </SafeAreaView>
  );
}
