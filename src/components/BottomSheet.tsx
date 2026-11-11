import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Modal, Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme';

type Props = { visible: boolean; onClose: () => void; children: ReactNode };

export function BottomSheet({ visible, onClose, children }: Props) {
  const { tw } = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent onRequestClose={onClose}>
      <KeyboardAvoidingView behavior="padding" style={tw`flex-1 justify-end`}>
        <Pressable accessibilityLabel="Close" onPress={onClose} style={tw`absolute inset-0 bg-scrim`} />
        <View
          style={[
            tw`gap-4 rounded-t-2xl border-t border-line bg-card px-4 pt-2`,
            { paddingBottom: insets.bottom + 20 },
          ]}
        >
          <View style={tw`h-1 w-9 self-center rounded-sm bg-line`} />
          {children}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
