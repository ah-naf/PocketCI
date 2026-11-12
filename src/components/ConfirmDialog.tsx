import type { ReactNode } from 'react';
import { Modal, Pressable, View } from 'react-native';
import { useTheme } from '../theme';
import { AppText } from './AppText';
import { Button } from './Button';

type Props = {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  submitting: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  children?: ReactNode;
};

export function ConfirmDialog({ visible, title, message, confirmLabel, submitting, onConfirm, onCancel, children }: Props) {
  const { tw } = useTheme();
  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent onRequestClose={onCancel}>
      <View style={tw`flex-1 justify-center px-4`}>
        <Pressable accessibilityLabel="Close" onPress={onCancel} style={tw`absolute inset-0 bg-scrim`} />
        <View style={tw`gap-4 rounded-2xl border border-line bg-card p-5`}>
          <View style={tw`gap-1`}>
            <AppText variant="heading">{title}</AppText>
            <AppText variant="small">{message}</AppText>
          </View>
          {children}
          <View style={tw`flex-row gap-3`}>
            <Button variant="ghost" label="Cancel" onPress={onCancel} style={tw`flex-1`} />
            <Button variant="primary" label={confirmLabel} onPress={onConfirm} loading={submitting} style={tw`flex-1`} />
          </View>
        </View>
      </View>
    </Modal>
  );
}
