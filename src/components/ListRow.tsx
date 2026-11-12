import type { ReactNode } from 'react';
import { Pressable, View } from 'react-native';
import { useTheme } from '../theme';
import { AppText } from './AppText';
import { Icon } from './Icon';
import { IconButton } from './IconButton';

type Props = {
  leading?: ReactNode;
  title: string;
  subtitle?: string;
  tag?: string;
  accentTag?: boolean;
  monoTitle?: boolean;
  onPress?: () => void;
  onLongPress?: () => void;
  favorite?: boolean;
  onToggleFavorite?: () => void;
};

export function ListRow({ leading, title, subtitle, tag, accentTag, monoTitle, onPress, onLongPress, favorite, onToggleFavorite }: Props) {
  const { tw, colors } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      onLongPress={onLongPress}
      android_ripple={{ color: colors.raised }}
      style={tw.style(
        'flex-row items-center gap-3 border-b border-line bg-bg px-4',
        subtitle ? 'min-h-[68px] py-3' : 'min-h-[52px] py-2',
      )}
    >
      {leading}
      <View style={tw`min-w-0 flex-1 gap-0.5`}>
        <AppText
          variant={monoTitle ? 'body' : 'title'}
          mono={monoTitle}
          numberOfLines={1}
          style={monoTitle ? tw`text-sm font-mono-medium` : undefined}
        >
          {title}
        </AppText>
        {subtitle && (
          <AppText variant="small" mono numberOfLines={1} style={tw`text-xs leading-4`}>
            {subtitle}
          </AppText>
        )}
      </View>
      {tag && (
        <View
          style={tw.style(
            'h-[22px] max-w-[38%] shrink-0 justify-center rounded-md border px-1.5',
            accentTag ? 'border-accent/45' : 'border-line',
          )}
        >
          <AppText variant="caption" mono numberOfLines={1} tone={accentTag ? 'accent' : 'muted'} style={tw`text-[11px]`}>
            {tag}
          </AppText>
        </View>
      )}
      {onToggleFavorite && (
        <IconButton
          icon="eye"
          color={favorite ? 'accent' : 'dim'}
          active={favorite}
          label={favorite ? 'Unfollow' : 'Follow'}
          onPress={onToggleFavorite}
        />
      )}
      <Icon name="chevronRight" color="dim" size={18} />
    </Pressable>
  );
}
