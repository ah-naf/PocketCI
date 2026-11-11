import { View } from 'react-native';
import { useTheme } from '../theme';
import { AppText } from './AppText';
import { Input } from './Input';

type Props = {
  baseUrl: string;
  token: string;
  onChangeBaseUrl: (value: string) => void;
  onChangeToken: (value: string) => void;
  tokenInvalid?: boolean;
};

export function ConnectionForm({ baseUrl, token, onChangeBaseUrl, onChangeToken, tokenInvalid }: Props) {
  const { tw } = useTheme();
  return (
    <View style={tw`gap-4`}>
      <Input
        label="GitLab base URL"
        value={baseUrl}
        onChangeText={onChangeBaseUrl}
        keyboardType="url"
      />
      <View style={tw`gap-1.5`}>
        <Input
          label="Access token"
          value={token}
          onChangeText={onChangeToken}
          placeholder="glpat-…"
          invalid={tokenInvalid}
          secure
        />
        <AppText variant="caption">
          The token needs the{' '}
          <AppText variant="caption" mono tone="accent">
            api
          </AppText>{' '}
          scope. Create one in GitLab under Preferences → Access tokens.
        </AppText>
      </View>
    </View>
  );
}
