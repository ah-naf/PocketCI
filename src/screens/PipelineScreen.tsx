import { useIsFocused } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback, useMemo } from 'react';
import { Linking, View } from 'react-native';
import { fetchJobs, fetchPipeline } from '../api/pipelines';
import { AppRefreshControl } from '../components/AppRefreshControl';
import { AppText } from '../components/AppText';
import { ErrorView } from '../components/ErrorView';
import { LiveBadge } from '../components/LiveBadge';
import { LoadingRow } from '../components/LoadingRow';
import { PipelineSummaryCard } from '../components/PipelineSummaryCard';
import { Screen } from '../components/Screen';
import { StageSection } from '../components/StageSection';
import { useAsync } from '../hooks/useAsync';
import { useNow } from '../hooks/useNow';
import { usePoll } from '../hooks/usePoll';
import type { RootStackParamList } from '../navigation/RootNavigator';
import { useTheme } from '../theme';
import { formatPipelineElapsed } from '../utils/format';
import { groupJobsByStage } from '../utils/stages';
import { isPipelineActive } from '../utils/status';

type Props = NativeStackScreenProps<RootStackParamList, 'Pipeline'>;

const POLL_INTERVAL_MS = 4000;

export function PipelineScreen({ navigation, route }: Props) {
  const { projectId, projectName, pipelineId } = route.params;
  const { tw } = useTheme();
  const focused = useIsFocused();

  const loadPipeline = useCallback(() => fetchPipeline(projectId, pipelineId), [projectId, pipelineId]);
  const loadJobs = useCallback(() => fetchJobs(projectId, pipelineId), [projectId, pipelineId]);
  const pipeline = useAsync(loadPipeline);
  const jobs = useAsync(loadJobs);

  const active = pipeline.data ? isPipelineActive(pipeline.data.status) : true;
  const now = useNow(active);
  usePoll(
    () => {
      pipeline.poll();
      jobs.poll();
    },
    POLL_INTERVAL_MS,
    active && focused,
  );

  const stages = useMemo(() => groupJobsByStage(jobs.data ?? []), [jobs.data]);
  const error = pipeline.error ?? jobs.error;

  return (
    <Screen
      title={`#${pipelineId}`}
      subtitle={projectName}
      monoTitle
      headerRight={active && pipeline.data ? <LiveBadge /> : undefined}
      onBack={navigation.goBack}
      scroll
      refreshControl={
        <AppRefreshControl
          refreshing={pipeline.refreshing || jobs.refreshing}
          onRefresh={() => {
            pipeline.reload();
            jobs.reload();
          }}
        />
      }
    >
      {pipeline.loading && <LoadingRow label="Loading pipeline" />}
      {error !== undefined && <ErrorView error={error} onRetry={pipeline.reload} />}
      {pipeline.data && (
        <PipelineSummaryCard
          pipeline={pipeline.data}
          elapsed={formatPipelineElapsed(pipeline.data, now)}
          onOpenInGitlab={() => Linking.openURL(pipeline.data?.web_url ?? '')}
        />
      )}
      <View style={tw`pb-8 pt-4`}>
        {stages.map((stage) => (
          <StageSection
            key={stage.name}
            stage={stage}
            now={now}
            onJobPress={(job) =>
              navigation.navigate('JobLog', {
                projectId,
                jobId: job.id,
                jobName: job.name,
                status: job.status,
              })
            }
          />
        ))}
        {jobs.data?.length === 0 && (
          <AppText variant="small" style={tw`px-4`}>
            No jobs yet.
          </AppText>
        )}
      </View>
    </Screen>
  );
}
