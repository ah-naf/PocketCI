import { useFocusEffect, useIsFocused } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback, useMemo } from 'react';
import { Linking, View } from 'react-native';
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
import { useProvider } from '../providers/ProviderContext';
import { useTheme } from '../theme';
import { confirmCancel } from '../utils/confirmCancel';
import { formatPipelineElapsed } from '../utils/format';
import { groupJobsByStage } from '../utils/stages';
import { isPipelineActive } from '../utils/status';

type Props = NativeStackScreenProps<RootStackParamList, 'Pipeline'>;

const POLL_INTERVAL_MS = 4000;

export function PipelineScreen({ navigation, route }: Props) {
  const { project, runId } = route.params;
  const { tw } = useTheme();
  const provider = useProvider();
  const focused = useIsFocused();

  const loadRun = useCallback(() => provider.getRun(project, runId), [provider, project, runId]);
  const loadJobs = useCallback(() => provider.listJobs(project, runId), [provider, project, runId]);
  const run = useAsync(loadRun);
  const jobs = useAsync(loadJobs);

  useFocusEffect(
    useCallback(() => {
      run.poll();
      jobs.poll();
    }, [run.poll, jobs.poll]),
  );

  const active = run.data ? isPipelineActive(run.data.status) : true;
  const now = useNow(active);
  usePoll(
    () => {
      run.poll();
      jobs.poll();
    },
    POLL_INTERVAL_MS,
    active && focused,
  );

  const cancelRunningRun = () =>
    confirmCancel(provider.labels.run, provider.displayName, () => provider.cancelRun(project, runId), () => {
      run.poll();
      jobs.poll();
    });

  const forceCancelRunningRun = () =>
    confirmCancel(
      provider.labels.run,
      provider.displayName,
      () => provider.forceCancelRun(project, runId),
      () => {
        run.poll();
        jobs.poll();
      },
      true,
    );

  const stages = useMemo(() => groupJobsByStage(jobs.data ?? []), [jobs.data]);
  const error = run.error ?? jobs.error;

  return (
    <Screen
      title={`#${runId}`}
      subtitle={project.name}
      monoTitle
      headerRight={active && run.data ? <LiveBadge /> : undefined}
      onBack={navigation.goBack}
      scroll
      refreshControl={
        <AppRefreshControl
          refreshing={run.refreshing || jobs.refreshing}
          onRefresh={() => {
            run.reload();
            jobs.reload();
          }}
        />
      }
    >
      {run.loading && <LoadingRow label={`Loading ${provider.labels.run}`} />}
      {error !== undefined && <ErrorView error={error} onRetry={run.reload} />}
      {run.data && (
        <PipelineSummaryCard
          pipeline={run.data}
          elapsed={formatPipelineElapsed(run.data, now)}
          openLabel={`Open in ${provider.displayName}`}
          cancelLabel={`Cancel ${provider.labels.run}`}
          onOpenExternal={() => Linking.openURL(run.data?.webUrl ?? '')}
          onCancel={active && run.data.status !== 'canceling' ? cancelRunningRun : undefined}
          onForceCancel={active && provider.capabilities.forceCancelRun ? forceCancelRunningRun : undefined}
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
                project,
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
