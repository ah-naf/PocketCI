import { Linking } from 'react-native';
import { GITHUB_CLIENT_ID } from '../api/githubAuth';
import { AppText } from './AppText';
import { useTheme } from '../theme';

const ORG_ACCESS_URL = `https://github.com/settings/connections/applications/${GITHUB_CLIENT_ID}`;

export function GithubOrgHint() {
  const { tw } = useTheme();
  return (
    <AppText variant="caption" style={tw`text-center`}>
      Missing org repos? Ask the org owner to approve PocketCI.{' '}
      <AppText variant="caption" tone="accent" onPress={() => Linking.openURL(ORG_ACCESS_URL).catch(() => undefined)}>
        Check access
      </AppText>
    </AppText>
  );
}
