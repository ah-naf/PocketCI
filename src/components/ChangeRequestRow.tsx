import { Pressable, View } from 'react-native';
import { useTheme } from '../theme';
import { AppText } from './AppText';
import { Avatar } from './Avatar';
import { Icon } from './Icon';

type Props = {
  id: string;
  title: string;
  author: string;
  authorAvatar: string | null;
  sourceBranch: string;
  targetBranch: string;
  draft: boolean;
  ago: string;
  onPress: () => void;
};

export function ChangeRequestRow({ id, title, author, authorAvatar, sourceBranch, targetBranch, draft, ago, onPress }: Props) {
  const { tw, colors } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      android_ripple={{ color: colors.raised }}
      style={tw`flex-row items-center gap-3 border-b border-line px-4 py-3`}
    >
      <Avatar uri={authorAvatar} name={author} size={32} />
      <View style={tw`min-w-0 flex-1 gap-1`}>
        <AppText variant="title" numberOfLines={2}>
          {title}
        </AppText>
        <AppText variant="caption" mono numberOfLines={1} tone="muted" style={tw`text-[11px]`}>
          {sourceBranch} into {targetBranch}
        </AppText>
        <AppText variant="caption" numberOfLines={1}>
          #{id} by {author}, {ago}
        </AppText>
      </View>
      {draft && (
        <View style={tw`h-[22px] justify-center rounded-md border border-line px-1.5`}>
          <AppText variant="caption" mono tone="muted" style={tw`text-[11px]`}>
            draft
          </AppText>
        </View>
      )}
      <Icon name="chevronRight" color="dim" size={18} />
    </Pressable>
  );
}
