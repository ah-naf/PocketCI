import { useEffect, useState } from 'react';
import { Image, View } from 'react-native';
import { useTheme } from '../theme';
import { AppText } from './AppText';

type Props = { uri?: string | null; name: string; size?: number };

export function Avatar({ uri, name, size = 24 }: Props) {
  const { tw } = useTheme();
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [uri]);

  const shape = { width: size, height: size, borderRadius: size / 2 };

  if (!uri || failed) {
    return (
      <View accessibilityLabel={name} style={[tw`items-center justify-center border border-line bg-raised`, shape]}>
        <AppText variant="caption" tone="muted" style={{ fontSize: Math.round(size * 0.45), lineHeight: size }}>
          {name.trim().charAt(0).toUpperCase() || '?'}
        </AppText>
      </View>
    );
  }

  return (
    <Image
      source={{ uri }}
      accessibilityLabel={`${name} avatar`}
      onError={() => setFailed(true)}
      style={[tw`bg-raised`, shape]}
    />
  );
}
