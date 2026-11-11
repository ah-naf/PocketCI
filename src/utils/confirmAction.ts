import { Alert } from 'react-native';
import { describeError } from '../api/errors';

type ConfirmOptions = {
  title: string;
  message: string;
  confirmLabel: string;
  dismissLabel: string;
  destructive?: boolean;
};

export function confirmAction(
  { title, message, confirmLabel, dismissLabel, destructive }: ConfirmOptions,
  action: () => Promise<unknown>,
  onDone: () => void,
) {
  Alert.alert(title, message, [
    { text: dismissLabel, style: 'cancel' },
    {
      text: confirmLabel,
      style: destructive ? 'destructive' : 'default',
      onPress: async () => {
        try {
          await action();
          onDone();
        } catch (error) {
          const { title: errorTitle, message: errorMessage } = describeError(error);
          Alert.alert(errorTitle, errorMessage);
        }
      },
    },
  ]);
}
