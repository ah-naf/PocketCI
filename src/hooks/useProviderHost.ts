import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { useProvider } from '../providers/ProviderContext';
import { loadCredentials } from '../storage/secure';

export function useProviderHost() {
  const provider = useProvider();
  const [host, setHost] = useState('');

  useFocusEffect(
    useCallback(() => {
      loadCredentials(provider.id, provider.setup.defaultBaseUrl).then(({ baseUrl }) =>
        setHost(baseUrl.replace(/^https?:\/\//, '').split('/')[0]),
      );
    }, [provider]),
  );

  return host;
}
