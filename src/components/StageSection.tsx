import { View } from 'react-native';
import type { Job } from '../providers/types';
import { useTheme } from '../theme';
import { getStatusStyle } from '../theme/status';
import { countFinishedJobs, getStageStatus, type Stage } from '../utils/stages';
import { AppText } from './AppText';
import { JobRow } from './JobRow';

type Props = { stage: Stage; now: number; onJobPress: (job: Job) => void };

export function StageSection({ stage, now, onJobPress }: Props) {
  const { tw } = useTheme();
  const status = getStageStatus(stage.jobs);
  const pending = status === 'pending';
  const { color } = getStatusStyle(status);

  return (
    <View style={tw`pt-2`}>
      <View style={tw`h-9 flex-row items-center gap-3 px-4`}>
        <View style={tw`w-6 items-center`}>
          <View style={tw.style('h-[9px] w-[9px]', pending ? 'border-[1.5px] border-dim' : `bg-${color}`)} />
        </View>
        <AppText variant="label" tone={pending ? 'dim' : 'fg'} style={tw`flex-1`}>
          {stage.name}
        </AppText>
        <AppText variant="caption" mono style={tw`text-[11px]`}>
          {countFinishedJobs(stage.jobs)} / {stage.jobs.length}
        </AppText>
      </View>
      <View style={tw`ml-[27.5px] border-l border-line pl-3`}>
        {stage.jobs.map((job) => (
          <JobRow key={job.id} job={job} now={now} onPress={() => onJobPress(job)} />
        ))}
      </View>
    </View>
  );
}
