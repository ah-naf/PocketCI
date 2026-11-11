import { View } from 'react-native';
import { describeError } from '../api/errors';
import { useProvider } from '../providers/ProviderContext';
import { useTheme } from '../theme';
import { Banner } from './Banner';
import { Button } from './Button';

type Props = { error: unknown; onRetry?: () => void };

export function ErrorView({ error, onRetry }: Props) {
  const { tw } = useTheme();
  const { displayName } = useProvider();
  const { title, message, detail } = describeError(error, displayName);
  return (
    <View style={tw`gap-3 p-4`}>
      <Banner variant="failed" title={title} message={message} detail={detail} />
      {onRetry && <Button label="Try again" onPress={onRetry} />}
    </View>
  );
}
