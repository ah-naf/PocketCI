import * as Clipboard from 'expo-clipboard';
import { useState } from 'react';
import { ActivityIndicator, Linking, View } from 'react-native';
import { useTheme } from '../theme';
import { AppText } from './AppText';
import { Button } from './Button';

type Props = { providerName: string; code: string; verificationUri: string; onCancel: () => void };

export function DeviceCodeCard({ providerName, code, verificationUri, onCancel }: Props) {
  const { tw, colors } = useTheme();
  const [copied, setCopied] = useState(false);

  async function copyCode() {
    await Clipboard.setStringAsync(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <View style={tw`gap-3`}>
      <View style={tw`items-center gap-2 rounded-2xl border border-line bg-card p-5`}>
        <AppText variant="label">Enter this code on {providerName}</AppText>
        <AppText mono selectable style={tw`text-[34px] leading-[40px] tracking-widest`}>
          {code}
        </AppText>
        <View style={tw`flex-row items-center gap-2`}>
          <ActivityIndicator size="small" color={colors.muted} />
          <AppText variant="small">Waiting for approval…</AppText>
        </View>
      </View>
      <Button variant="primary" label={`Open ${providerName}`} onPress={() => Linking.openURL(verificationUri).catch(() => undefined)} />
      <Button label={copied ? 'Copied' : 'Copy code'} onPress={copyCode} />
      <Button variant="ghost" label="Cancel" onPress={onCancel} />
    </View>
  );
}
