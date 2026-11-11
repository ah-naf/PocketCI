import AsyncStorage from '@react-native-async-storage/async-storage';
import type { ProviderId } from '../providers/types';

const ACTIVE_PROVIDER_KEY = 'active_provider';

export async function loadActiveProvider(): Promise<ProviderId> {
  try {
    const stored = await AsyncStorage.getItem(ACTIVE_PROVIDER_KEY);
    return stored === 'github' ? 'github' : 'gitlab';
  } catch {
    return 'gitlab';
  }
}

export function saveActiveProvider(id: ProviderId) {
  return AsyncStorage.setItem(ACTIVE_PROVIDER_KEY, id);
}
