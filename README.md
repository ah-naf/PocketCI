# GitLab Pipeline Manager

Personal mobile app (Expo, React Native, TypeScript) for a self-hosted GitLab. It calls the GitLab REST API directly. There is no backend.

## Setup

```bash
npm install
npx expo start
```

Scan the QR code with Expo Go (Android) or the Camera app (iOS). The phone and the computer must be on the same network.

## Access token

1. In GitLab open Preferences → Access tokens.
2. Create a classic personal access token or a project access token with the `api` scope. The scope is required to create pipelines.
3. Paste it into the app when it asks. It is stored only in the device's secure storage and stays until you remove it in Settings.

Do not use a pipeline trigger token (it cannot read anything). Avoid fine-grained tokens: they fail with `insufficient_granular_scope` on this instance.

The base URL defaults to `https://gitlab.niftycoders.net/api/v4` and can be changed in Settings.

## Troubleshooting

- **Can't reach GitLab:** the instance may only be reachable on the company network. Connect to the VPN and try again.
- **Certificate errors:** if the company uses an internal certificate authority, install the CA certificate on the phone (Android: Settings → Security → Encryption and credentials → Install a certificate → CA certificate; iOS: install the profile, then enable it under Settings → General → About → Certificate Trust Settings). The app never disables certificate checks.
- **Expo Go on Android and user CAs:** Expo Go may ignore user-installed CAs. If the error stays, build a local dev build with `npx expo run:android`.
