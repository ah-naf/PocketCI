import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useState } from 'react';
import { Linking, View } from 'react-native';
import { AppRefreshControl } from '../components/AppRefreshControl';
import { AppText } from '../components/AppText';
import { Avatar } from '../components/Avatar';
import { Banner } from '../components/Banner';
import { Button } from '../components/Button';
import { CommentCard } from '../components/CommentCard';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { ErrorView } from '../components/ErrorView';
import { LoadingRow } from '../components/LoadingRow';
import { Markdown } from '../components/Markdown';
import { Screen } from '../components/Screen';
import { StatusBadge } from '../components/StatusBadge';
import { describeError } from '../api/errors';
import { useAsync } from '../hooks/useAsync';
import type { RootStackParamList } from '../navigation/RootNavigator';
import { useProvider } from '../providers/ProviderContext';
import { useTheme } from '../theme';
import { approvalBadge, approvalSummary, stateBadge } from '../utils/changeRequestStatus';
import { formatRelativeTime } from '../utils/format';
import { errorHaptic, successHaptic, tapHaptic } from '../utils/haptics';

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
  const request = useAsync(['changeRequest', project.key, requestId], loadRequest, { staleTimeMs: 30_000 });
  const comments = useAsync(['changeRequestComments', project.key, requestId], loadComments, { staleTimeMs: 30_000 });
  const data = request.data;
  const state = data && stateBadge(data.state, data.draft);
  const review = data && approvalBadge(data.approval);
  const queryClient = useQueryClient();
  const [merging, setMerging] = useState(false);
  const [mergeOpen, setMergeOpen] = useState(false);
  const [mergeNotice, setMergeNotice] = useState<{ variant: 'success' | 'failed'; text: string }>();

  async function merge(headSha: string) {
    tapHaptic();
    setMerging(true);
    setMergeNotice(undefined);
    try {
      await provider.mergeChangeRequest(project, requestId, headSha);
      successHaptic();
      setMergeNotice({ variant: 'success', text: 'Merged' });
    } catch (error) {
      errorHaptic();
      setMergeNotice({ variant: 'failed', text: describeError(error, provider.displayName).message });
    } finally {
      setMerging(false);
      setMergeOpen(false);
      queryClient.invalidateQueries({ queryKey: [provider.id, 'changeRequests', project.key] });
      request.reload();
      comments.reload();
    }
  }

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
              <Markdown>{data.description}</Markdown>
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

          {mergeNotice && <Banner variant={mergeNotice.variant} title={mergeNotice.text} />}
          {data.canMerge && (
            <Button
              variant="primary"
              label="Merge"
              loading={merging}
              disabled={data.blockedReason !== null}
              onPress={() => setMergeOpen(true)}
            />
          )}
          <Button variant="ghost" label={`Open in ${provider.displayName}`} onPress={() => Linking.openURL(data.webUrl)} />
        </View>
      )}
      {data && (
        <ConfirmDialog
          visible={mergeOpen}
          title={`Merge #${requestId}?`}
          message={`This merges into ${data.targetBranch} on ${provider.displayName}. It can't be undone from the app.`}
          confirmLabel="Merge"
          submitting={merging}
          onConfirm={() => merge(data.headSha)}
          onCancel={() => !merging && setMergeOpen(false)}
        >
          <View style={tw`gap-2.5`}>
            <View>
              <AppText variant="label">Title</AppText>
              <AppText style={tw`text-sm`}>{data.title}</AppText>
            </View>
            <View>
              <AppText variant="label">Branch</AppText>
              <AppText mono style={tw`text-sm`}>
                {data.sourceBranch} into {data.targetBranch}
              </AppText>
            </View>
            <View>
              <AppText variant="label">Commit</AppText>
              <AppText mono style={tw`text-sm`}>
                {data.headSha.slice(0, 8)}
              </AppText>
            </View>
          </View>
        </ConfirmDialog>
      )}
    </Screen>
  );
}
