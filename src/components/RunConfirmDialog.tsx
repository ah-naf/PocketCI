import { Modal, Pressable, ScrollView, View } from 'react-native';
import type { VariableEntry } from '../hooks/usePipelineForm';
import { useTheme } from '../theme';
import { AppText } from './AppText';
import { Button } from './Button';

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
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent onRequestClose={onCancel}>
      <View style={tw`flex-1 justify-center px-4`}>
        <Pressable accessibilityLabel="Close" onPress={onCancel} style={tw`absolute inset-0 bg-scrim`} />
        <View style={tw`gap-4 rounded-2xl border border-line bg-card p-5`}>
          <View style={tw`gap-1`}>
            <AppText variant="heading">Run {actionLabel}?</AppText>
            <AppText variant="small">
              This starts a new {runLabel} on {serviceName} with the values below.
            </AppText>
          </View>
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
            <ScrollView style={tw`max-h-60 rounded-xl border border-line bg-bg`} contentContainerStyle={tw`gap-1 p-2.5`}>
              {entries.length === 0 && (
                <AppText variant="caption" mono>
                  No variables
                </AppText>
              )}
              {entries.map(({ key, value }) => (
                <View key={key} style={tw`flex-row gap-3`}>
                  <AppText variant="caption" mono tone="muted" style={tw`shrink-0 text-xs leading-[18px]`}>
                    {key}
                  </AppText>
                  <AppText variant="caption" mono tone="fg" style={tw`flex-1 text-xs leading-[18px]`}>
                    {value}
                  </AppText>
                </View>
              ))}
            </ScrollView>
          </View>
          <View style={tw`flex-row gap-3`}>
            <Button variant="ghost" label="Cancel" onPress={onCancel} style={tw`flex-1`} />
            <Button
              variant="primary"
              label={`Run ${actionLabel}`}
              onPress={onConfirm}
              loading={submitting}
              style={tw`flex-1`}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}
