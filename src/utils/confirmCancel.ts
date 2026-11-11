import { Alert } from 'react-native';
import { describeError } from '../api/errors';

export function confirmCancel(subject: 'pipeline' | 'job', cancel: () => Promise<unknown>, onDone: () => void) {
  Alert.alert(`Cancel this ${subject}?`, `GitLab stops the ${subject} and it can't be resumed.`, [
    { text: `Keep running`, style: 'cancel' },
    {
      text: `Cancel ${subject}`,
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
