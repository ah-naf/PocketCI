import { useEffect, useState } from 'react';
import { isGithubOAuthLogin } from '../storage/secure';

export function useGithubOAuthLogin() {
  const [oauth, setOauth] = useState(false);
  useEffect(() => {
    isGithubOAuthLogin().then(setOauth);
  }, []);
  return oauth;
}
