import { ScrollView, View } from 'react-native';
import type { VariableEntry } from '../hooks/usePipelineForm';
import { useTheme } from '../theme';
import { AppText } from './AppText';
import { ConfirmDialog } from './ConfirmDialog';
import { VariableList } from './VariableList';

type Props = {
  visible: boolean;
  branch: string;
  projectName: string;
  entries: VariableEntry[];
  actionLabel: string;
  runLabel: string;
  serviceName: string;
  submitting: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export function RunConfirmDialog({
  visible,
  branch,
  projectName,
  entries,
  actionLabel,
  runLabel,
  serviceName,
  submitting,
  onConfirm,
  onCancel,
}: Props) {
  const { tw } = useTheme();
  return (
    <ConfirmDialog
      visible={visible}
      title={`Run ${actionLabel}?`}
      message={`This starts a new ${runLabel} on ${serviceName} with the values below.`}
      confirmLabel={`Run ${actionLabel}`}
      submitting={submitting}
      onConfirm={onConfirm}
      onCancel={onCancel}
    >
      <View style={tw`gap-2.5`}>
        <View>
          <AppText variant="label">Branch</AppText>
          <AppText mono style={tw`text-sm`}>
            {branch}
          </AppText>
        </View>
        <View>
          <AppText variant="label">Project</AppText>
          <AppText style={tw`text-sm`}>{projectName}</AppText>
        </View>
      </View>
      <View style={tw`gap-1.5`}>
        <AppText variant="label">Variables · {entries.length}</AppText>
        <ScrollView style={tw`max-h-64 overflow-hidden rounded-xl border border-line bg-bg`}>
          <VariableList entries={entries} />
        </ScrollView>
      </View>
    </ConfirmDialog>
  );
}
