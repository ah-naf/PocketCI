import { useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, Animated, Easing, View } from 'react-native';
import { useTheme, type ColorName } from '../theme';

type Props = { color: ColorName; pulsing?: boolean; size?: number };

const PULSE_MS = 1600;

export function PulseDot({ color, pulsing = false, size = 8 }: Props) {
  const { tw } = useTheme();
  const progress = useRef(new Animated.Value(0)).current;
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion);
  }, []);

  const animate = pulsing && !reduceMotion;

  useEffect(() => {
    if (!animate) return;
    const loop = Animated.loop(
      Animated.timing(progress, {
        toValue: 1,
        duration: PULSE_MS,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
    );
    loop.start();
    return () => {
      loop.stop();
      progress.setValue(0);
    };
  }, [animate, progress]);

  return (
    <View style={{ width: size, height: size }}>
      {animate && (
        <Animated.View
          style={[
            tw`absolute inset-0 rounded-full bg-${color}`,
            {
              opacity: progress.interpolate({ inputRange: [0, 1], outputRange: [0.55, 0] }),
              transform: [{ scale: progress.interpolate({ inputRange: [0, 1], outputRange: [1, 2.8] }) }],
            },
          ]}
        />
      )}
      <View style={tw`h-full w-full rounded-full bg-${color}`} />
    </View>
  );
}
