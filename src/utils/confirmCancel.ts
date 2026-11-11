import { Alert } from 'react-native';
import { describeError } from '../api/errors';

export function confirmCancel(
  noun: string,
  service: string,
  cancel: () => Promise<unknown>,
  onDone: () => void,
  force = false,
) {
  const title = force ? `Force cancel this ${noun}?` : `Cancel this ${noun}?`;
  const message = force
    ? `${service} stops the ${noun} immediately and skips cleanup steps such as always(). Use this only when a normal cancel does not work.`
    : `${service} stops the ${noun} and it can't be resumed.`;
  Alert.alert(title, message, [
    { text: 'Keep running', style: 'cancel' },
    {
      text: force ? 'Force cancel' : `Cancel ${noun}`,
      style: 'destructive',
      onPress: async () => {
        try {
          await cancel();
          onDone();
        } catch (error) {
          const { title: errorTitle, message: errorMessage } = describeError(error);
          Alert.alert(errorTitle, errorMessage);
        }
      },
    },
  ]);
}
