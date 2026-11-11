import { View } from 'react-native';
import { useTheme } from '../theme';
import { AppText } from './AppText';
import { TextButton } from './TextButton';

type Props = { text: string; actionLabel: string; onAction: () => void; danger?: boolean };

export function NoticeBar({ text, actionLabel, onAction, danger }: Props) {
  const { tw } = useTheme();
  return (
    <View style={tw`flex-row items-center gap-3 border-b border-line bg-card py-1.5 pl-4 pr-2`}>
      <AppText variant="small" style={tw`flex-1`}>
        {text}
      </AppText>
      <TextButton label={actionLabel} onPress={onAction} danger={danger} />
    </View>
  );
}
