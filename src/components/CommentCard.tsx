import { View } from 'react-native';
import { useTheme } from '../theme';
import { AppText } from './AppText';
import { Avatar } from './Avatar';

type Props = { author: string; authorAvatar: string | null; ago: string; body: string; location: string | null };

export function CommentCard({ author, authorAvatar, ago, body, location }: Props) {
  const { tw } = useTheme();
  return (
    <View style={tw`gap-2.5 rounded-2xl border border-line bg-card p-3.5`}>
      <View style={tw`flex-row items-center gap-2.5`}>
        <Avatar uri={authorAvatar} name={author} size={28} />
        <AppText variant="title" numberOfLines={1} style={tw`min-w-0 flex-1 text-[15px]`}>
          {author}
        </AppText>
        <AppText variant="caption">{ago}</AppText>
      </View>
      {location && (
        <AppText variant="caption" mono numberOfLines={1} style={tw`rounded-md bg-raised px-2 py-1 text-[11px]`}>
          {location}
        </AppText>
      )}
      <AppText selectable style={tw`text-[14px] leading-[21px]`}>
        {body}
      </AppText>
    </View>
  );
}
