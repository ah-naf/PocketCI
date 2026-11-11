import { View } from 'react-native';
import type { Run } from '../providers/types';
import { useTheme } from '../theme';
import { AppText } from './AppText';
import { Button } from './Button';
import { StatusBadge } from './StatusBadge';

type Props = {
  pipeline: Run;
  elapsed: string;
  openLabel: string;
  cancelLabel: string;
  onOpenExternal: () => void;
  onCancel?: () => void;
  onForceCancel?: () => void;
};

export function PipelineSummaryCard({ pipeline, elapsed, openLabel, cancelLabel, onOpenExternal, onCancel, onForceCancel }: Props) {
  const { tw } = useTheme();
  return (
    <View style={tw`mx-4 gap-4 rounded-2xl border border-line bg-card p-4`}>
      <View style={tw`flex-row items-center justify-between`}>
        <StatusBadge status={pipeline.status} large />
        <AppText mono accessibilityLabel="Duration" style={tw`text-2xl font-mono-medium tracking-tight`}>
          {elapsed}
        </AppText>
      </View>
      <View style={tw`flex-row gap-4`}>
        <View style={tw`min-w-0 flex-1 gap-0.5`}>
          <AppText variant="label">Ref</AppText>
          <AppText mono numberOfLines={1} style={tw`text-[13px]`}>
            {pipeline.ref}
          </AppText>
        </View>
        <View style={tw`gap-0.5`}>
          <AppText variant="label">Commit</AppText>
          <AppText mono style={tw`text-[13px]`}>
            {pipeline.sha.slice(0, 8)}
          </AppText>
        </View>
      </View>
      <Button variant="ghost" label={openLabel} onPress={onOpenExternal} />
      {onCancel && <Button variant="danger" label={cancelLabel} onPress={onCancel} />}
      {onForceCancel && <Button variant="danger" label="Force cancel" onPress={onForceCancel} />}
    </View>
  );
}
