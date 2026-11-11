import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { loadSettings } from '../storage/secure';

export function useGitlabHost() {
  const [host, setHost] = useState('');

  useFocusEffect(
    useCallback(() => {
      loadSettings().then(({ baseUrl }) => setHost(baseUrl.replace(/^https?:\/\//, '').split('/')[0]));
    }, []),
  );

  return host;
}
