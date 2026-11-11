import type { ReactNode } from 'react';
import { View } from 'react-native';
import { useTheme } from '../theme';
import { AppText } from './AppText';
import { BottomSheet } from './BottomSheet';
import { Button } from './Button';

type Props = {
  visible: boolean;
  title: string;
  message: ReactNode;
  confirmLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
  children?: ReactNode;
};

export function ConfirmSheet({ visible, title, message, confirmLabel, onConfirm, onCancel, children }: Props) {
  const { tw } = useTheme();
  return (
    <BottomSheet visible={visible} onClose={onCancel}>
      <View style={tw`gap-1`}>
        <AppText variant="heading">{title}</AppText>
        <AppText variant="small">{message}</AppText>
      </View>
      {children}
      <View style={tw`flex-row gap-3`}>
        <Button variant="ghost" label="Cancel" onPress={onCancel} style={tw`flex-1`} />
        <Button variant="dangerSolid" label={confirmLabel} onPress={onConfirm} style={tw`flex-1`} />
      </View>
    </BottomSheet>
  );
}
