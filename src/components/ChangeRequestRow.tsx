import { Pressable, View } from 'react-native';
import type { ChangeRequestState } from '../providers/types';
import { useTheme } from '../theme';
import { stateBadge } from '../utils/changeRequestStatus';
import { AppText } from './AppText';
import { Avatar } from './Avatar';
import { Icon } from './Icon';
import { StatusBadge } from './StatusBadge';

type Props = {
  id: string;
  title: string;
  author: string;
  authorAvatar: string | null;
  sourceBranch: string;
  targetBranch: string;
  state: ChangeRequestState;
  draft: boolean;
  ago: string;
  onPress: () => void;
};

export function ChangeRequestRow({ id, title, author, authorAvatar, sourceBranch, targetBranch, state, draft, ago, onPress }: Props) {
  const { tw, colors } = useTheme();
  const badge = stateBadge(state, draft);
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
      {badge.label !== 'Open' && <StatusBadge status={badge.status} label={badge.label} />}
      <Icon name="chevronRight" color="dim" size={18} />
    </Pressable>
  );
}
