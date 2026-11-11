import type { RunInput } from '../providers/types';
import { Input } from './Input';
import { PickerField } from './PickerField';

type Props = {
  variables: RunInput[];
  edits: Record<string, string>;
  onChange: (key: string, value: string) => void;
};

export function VariableFields({ variables, edits, onChange }: Props) {
  return (
    <>
      {variables.map(({ key, defaultValue, options, label }) => {
        const current = edits[key] ?? defaultValue;
        const handleChange = (next: string) => onChange(key, next);
        return options.length > 0 ? (
          <PickerField
            key={key}
            label={label}
            hint={key}
            value={current}
            options={options}
            onChange={handleChange}
          />
        ) : (
          <Input key={key} label={label} labelHint={key} value={current} onChangeText={handleChange} />
        );
      })}
    </>
  );
}
