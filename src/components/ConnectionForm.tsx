import { View } from 'react-native';
import { useProvider } from '../providers/ProviderContext';
import { useTheme } from '../theme';
import { AppText } from './AppText';
import { Input } from './Input';

type Props = {
  baseUrl: string;
  token: string;
  onChangeBaseUrl: (value: string) => void;
  onChangeToken: (value: string) => void;
  tokenInvalid?: boolean;
  tokenless?: boolean;
};

export function ConnectionForm({ baseUrl, token, onChangeBaseUrl, onChangeToken, tokenInvalid, tokenless }: Props) {
  const { tw } = useTheme();
  const { displayName, setup } = useProvider();
  return (
    <View style={tw`gap-4`}>
      {setup.editableBaseUrl && (
        <Input
          label={`${displayName} base URL`}
          value={baseUrl}
          onChangeText={onChangeBaseUrl}
          keyboardType="url"
        />
      )}
      {!tokenless && (
        <View style={tw`gap-1.5`}>
          <Input
            label="Access token"
            value={token}
            onChangeText={onChangeToken}
            placeholder="Paste your token"
            invalid={tokenInvalid}
            secure
          />
          <AppText variant="caption">{setup.tokenHint}</AppText>
        </View>
      )}
    </View>
  );
}
