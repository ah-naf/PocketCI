import type { ReactNode } from 'react';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../theme';
import { Header } from './Header';

type Props = {
  title?: string;
  subtitle?: string;
  onBack?: () => void;
  scroll?: boolean;
  children: ReactNode;
};

export function Screen({ title, subtitle, onBack, scroll, children }: Props) {
  const { tw } = useTheme();
  return (
    <SafeAreaView style={tw`flex-1 bg-bg`}>
      {title && <Header title={title} subtitle={subtitle} onBack={onBack} />}
      {scroll ? (
        <ScrollView
          contentContainerStyle={tw`grow`}
          keyboardShouldPersistTaps="handled"
          automaticallyAdjustKeyboardInsets
        >
          {children}
        </ScrollView>
      ) : (
        <View style={tw`flex-1`}>{children}</View>
      )}
    </SafeAreaView>
  );
}
