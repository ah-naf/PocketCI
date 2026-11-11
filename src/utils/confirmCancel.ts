import { Alert } from 'react-native';
import { describeError } from '../api/errors';

export function confirmCancel(noun: string, service: string, cancel: () => Promise<unknown>, onDone: () => void) {
  Alert.alert(`Cancel this ${noun}?`, `${service} stops the ${noun} and it can't be resumed.`, [
    { text: 'Keep running', style: 'cancel' },
    {
      text: `Cancel ${noun}`,
      style: 'destructive',
      onPress: async () => {
        try {
          await cancel();
          onDone();
        } catch (error) {
          const { title, message } = describeError(error);
          Alert.alert(title, message);
        }
      },
    },
  ]);
}
