import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { describeError } from '../api/errors';
import { useTheme } from '../theme';
import { AppText } from './AppText';
import { BottomSheet } from './BottomSheet';
import { Button } from './Button';
import { Input } from './Input';

type Props = {
  visible: boolean;
  onClose: () => void;
  onAdd: (projectId: string) => Promise<void>;
};

export function AddProjectSheet({ visible, onClose, onAdd }: Props) {
  const { tw } = useTheme();
  const [projectId, setProjectId] = useState('');
  const [error, setError] = useState<string>();
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!visible) {
      setProjectId('');
      setError(undefined);
    }
  }, [visible]);

  async function submit() {
    const trimmed = projectId.trim();
    if (!/^\d+$/.test(trimmed)) {
      setError('Enter the numeric project ID.');
      return;
    }
    setBusy(true);
    setError(undefined);
    try {
      await onAdd(trimmed);
    } catch (caught) {
      setError(describeError(caught).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <BottomSheet visible={visible} onClose={onClose}>
      <View style={tw`gap-1`}>
        <AppText variant="heading">Add project</AppText>
        <AppText variant="small">The app checks the ID against GitLab before saving it.</AppText>
      </View>
      <Input
        label="Project ID"
        value={projectId}
        onChangeText={setProjectId}
        keyboardType="number-pad"
        error={error}
        autoFocus
      />
      <Button variant="primary" label="Validate and save" onPress={submit} loading={busy} />
    </BottomSheet>
  );
}
