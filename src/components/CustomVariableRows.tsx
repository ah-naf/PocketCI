import { Pressable, View } from 'react-native';
import type { CustomVariable } from '../hooks/usePipelineForm';
import { useTheme } from '../theme';
import { AppText } from './AppText';
import { Icon } from './Icon';
import { Button } from './Button';
import { FieldLabel } from './FieldLabel';
import { Input } from './Input';

type Props = {
  rows: CustomVariable[];
  errors: Record<number, string>;
  onAdd: () => void;
  onChange: (id: number, patch: { key?: string; value?: string }) => void;
  onRemove: (id: number) => void;
};

export function CustomVariableRows({ rows, errors, onAdd, onChange, onRemove }: Props) {
  const { tw } = useTheme();
  return (
    <>
      {rows.map((row) => (
        <View key={row.id} style={tw`gap-1.5`}>
          <FieldLabel label="Custom variable" hint="KEY = VALUE" />
          <View style={tw`flex-row items-center gap-2`}>
            <View style={tw`flex-1`}>
              <Input
                accessibilityLabel="Variable key"
                placeholder="KEY"
                value={row.key}
                invalid={Boolean(errors[row.id])}
                onChangeText={(key) => onChange(row.id, { key })}
              />
            </View>
            <View style={tw`flex-1`}>
              <Input
                accessibilityLabel="Variable value"
                placeholder="value"
                value={row.value}
                onChangeText={(value) => onChange(row.id, { value })}
              />
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Remove variable"
              onPress={() => onRemove(row.id)}
              style={tw`-mr-2.5 h-11 w-11 items-center justify-center`}
            >
              <Icon name="close" size={18} />
            </Pressable>
          </View>
          {errors[row.id] && (
            <AppText variant="caption" tone="failed">
              {errors[row.id]}
            </AppText>
          )}
        </View>
      ))}
      <Button variant="dashed" label="+ Add custom variable" onPress={onAdd} />
    </>
  );
}
