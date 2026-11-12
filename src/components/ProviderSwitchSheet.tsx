import { Pressable, View } from 'react-native';
import type { ProviderId } from '../providers/types';
import { useTheme } from '../theme';
import { AppText } from './AppText';
import { BottomSheet } from './BottomSheet';
import { Icon } from './Icon';
import { ProviderLogo } from './ProviderLogo';

type Option = { id: ProviderId; displayName: string };

type Props = {
  visible: boolean;
  options: Option[];
  active: ProviderId;
  onSelect: (id: ProviderId) => void;
  onClose: () => void;
};

export function ProviderSwitchSheet({ visible, options, active, onSelect, onClose }: Props) {
  const { tw } = useTheme();
  return (
    <BottomSheet visible={visible} onClose={onClose}>
      <AppText variant="heading">Switch provider</AppText>
      {options.map(({ id, displayName }) => (
        <Pressable
          key={id}
          accessibilityRole="button"
          onPress={() => onSelect(id)}
          style={tw`h-12 flex-row items-center justify-between border-b border-line`}
        >
          <View style={tw`flex-row items-center gap-3`}>
            <ProviderLogo id={id} size={20} />
            <AppText tone={id === active ? 'accent' : 'fg'} style={tw`font-sans-semibold`}>
              {displayName}
            </AppText>
          </View>
          {id === active && <Icon name="check" color="accent" />}
        </Pressable>
      ))}
    </BottomSheet>
  );
}
