import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback } from 'react';
import { Linking, View } from 'react-native';
import { AppRefreshControl } from '../components/AppRefreshControl';
import { AppText } from '../components/AppText';
import { Avatar } from '../components/Avatar';
import { Banner } from '../components/Banner';
import { Button } from '../components/Button';
import { CommentCard } from '../components/CommentCard';
import { ErrorView } from '../components/ErrorView';
import { LoadingRow } from '../components/LoadingRow';
import { Screen } from '../components/Screen';
import { StatusBadge } from '../components/StatusBadge';
import { useAsync } from '../hooks/useAsync';
import type { RootStackParamList } from '../navigation/RootNavigator';
import { useProvider } from '../providers/ProviderContext';
import { useTheme } from '../theme';
import { approvalBadge, approvalSummary, stateBadge } from '../utils/changeRequestStatus';
import { formatRelativeTime } from '../utils/format';

type Props = NativeStackScreenProps<RootStackParamList, 'ChangeRequest'>;

export function ChangeRequestScreen({ navigation, route }: Props) {
  const { project, requestId } = route.params;
  const { tw } = useTheme();
  const provider = useProvider();
  const noun = provider.labels.changeRequest;

  const loadRequest = useCallback(() => provider.getChangeRequest(project, requestId), [provider, project, requestId]);
  const loadComments = useCallback(
    () => provider.listChangeRequestComments(project, requestId),
    [provider, project, requestId],
  );
  const request = useAsync(loadRequest);
  const comments = useAsync(loadComments);
  const data = request.data;
  const state = data && stateBadge(data.state, data.draft);
  const review = data && approvalBadge(data.approval);

  return (
    <Screen
      title={`#${requestId}`}
      subtitle={project.name}
      monoTitle
      onBack={navigation.goBack}
      scroll
      refreshControl={
        <AppRefreshControl
          refreshing={request.refreshing || comments.refreshing}
          onRefresh={() => {
            request.reload();
            comments.reload();
          }}
        />
      }
    >
      {request.loading && <LoadingRow label={`Loading ${noun.toLowerCase()}`} />}
      {request.error !== undefined && <ErrorView error={request.error} onRetry={request.reload} />}
      {data && state && review && (
        <View style={tw`gap-5 px-4 pb-10 pt-4`}>
          <View style={tw`gap-3`}>
            <AppText variant="heading">{data.title}</AppText>
            <View style={tw`flex-row items-center gap-2.5`}>
              <StatusBadge status={state.status} label={state.label} />
              <Avatar uri={data.authorAvatar} name={data.author} size={22} />
              <AppText variant="small" numberOfLines={1} style={tw`min-w-0 flex-1`}>
                {data.author}, {formatRelativeTime(data.updatedAt)}
              </AppText>
            </View>
            <AppText mono tone="muted" style={tw`text-[13px]`}>
              {data.sourceBranch} into {data.targetBranch}
            </AppText>
          </View>

          {data.state === 'open' && (
            <View style={tw`gap-2.5 rounded-2xl border border-line bg-card p-4`}>
              <StatusBadge status={review.status} label={review.label} large />
              <AppText variant="small">{approvalSummary(data.approval)}</AppText>
              {data.blockedReason && <Banner variant="manual" title={data.blockedReason} />}
            </View>
          )}

          <View style={tw`gap-2`}>
            <AppText variant="label">Description</AppText>
            {data.description ? (
              <AppText selectable>{data.description}</AppText>
            ) : (
              <AppText variant="small">No description.</AppText>
            )}
          </View>

          <View style={tw`gap-2.5`}>
            <AppText variant="label">Comments{comments.data ? ` · ${comments.data.length}` : ''}</AppText>
            {comments.loading && <LoadingRow label="Loading comments" />}
            {comments.error !== undefined && <ErrorView error={comments.error} onRetry={comments.reload} />}
            {comments.data?.length === 0 && <AppText variant="small">No comments yet.</AppText>}
            {comments.data?.map((comment) => (
              <CommentCard
                key={comment.id}
                author={comment.author}
                authorAvatar={comment.authorAvatar}
                ago={formatRelativeTime(comment.createdAt)}
                body={comment.body}
                location={comment.location}
              />
            ))}
          </View>

          <Button variant="ghost" label={`Open in ${provider.displayName}`} onPress={() => Linking.openURL(data.webUrl)} />
        </View>
      )}
    </Screen>
  );
}
