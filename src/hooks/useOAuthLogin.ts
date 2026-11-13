import { useEffect, useState } from 'react';
import { useProvider } from '../providers/ProviderContext';
import { isOAuthLogin } from '../storage/secure';

export function useOAuthLogin() {
  const { id } = useProvider();
  const [oauth, setOauth] = useState(false);
  useEffect(() => {
    isOAuthLogin(id).then(setOauth);
  }, [id]);
  return oauth;
}
