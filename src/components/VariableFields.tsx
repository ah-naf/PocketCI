import type { CiVariable } from '../api/ciVariables';
import { Input } from './Input';
import { PickerField } from './PickerField';

type Props = {
  variables: CiVariable[];
  edits: Record<string, string>;
  onChange: (key: string, value: string) => void;
};

export function VariableFields({ variables, edits, onChange }: Props) {
  return (
    <>
      {variables.map(({ key, value, options, description }) => {
        const current = edits[key] ?? value;
        const handleChange = (next: string) => onChange(key, next);
        return options.length > 0 ? (
          <PickerField
            key={key}
            label={description}
            hint={key}
            value={current}
            options={options}
            onChange={handleChange}
          />
        ) : (
          <Input key={key} label={description} labelHint={key} value={current} onChangeText={handleChange} />
        );
      })}
    </>
  );
}
