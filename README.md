# PocketCI

Personal mobile app (Expo, React Native, TypeScript) to run and watch pipelines on GitLab and GitHub. It calls their REST APIs directly. There is no backend and the app is never published.

## Status

Features:
- Token setup and Settings for GitLab and GitHub
- Switch between GitLab and GitHub from the Projects screen
- Project list with search (projects the token's user is a member of)
- Searchable branch list
- Pipeline form from the branch's CI variables, and trigger
- Live pipeline status with jobs grouped by stage
- Job logs with live follow, copy, and a last-2000-lines view
- Open merge requests (GitLab) and pull requests (GitHub): description, comments, and approval state
- Merge a merge request or pull request from its screen when your token's user is allowed to. It merges the commit you saw, so a push made after you opened the screen is rejected. Branch protection can still refuse a merge, and the provider's reason is shown
- Responses are cached in memory to stay under API rate limits; pull to refresh always reloads
- Follow up to 10 projects with the eye icon. The pulse icon in the header opens their latest runs and pulses while one is running; only running projects are polled, every 20 seconds

## Requirements

- Node 20 or newer
- For device builds: JDK 17, Android SDK (`ANDROID_HOME` set), USB debugging on the phone

## Setup

```bash
npm install
```

## Run the app

Expo Go (quick, shows the Expo Go name and icon):

```bash
npm start
```

Dev build (own name and icon, hot reload):

```bash
npm run android   # first time: builds and installs on the connected phone
npm run dev       # afterwards: starts the dev server for that build
```

Both scripts use `--localhost`, so the phone connects over the USB cable. This matters on WSL2, where the Wi-Fi address that Expo advertises is not reachable from the phone.

## Scripts

| Command | What it does |
|---|---|
| `npm start` | Dev server for Expo Go |
| `npm run dev` | Dev server for the installed dev build |
| `npm run android` | Build and install the debug dev build on the connected phone |
| `npm run android:release` | Build and install a release build on the connected phone |
| `npm run apk` | Build a release APK at `android/app/build/outputs/apk/release/app-release.apk` |
| `npm run clean` | Delete `android/` and `.expo/` for a fresh native build |
| `npm run typecheck` | Run `tsc --noEmit` |

The release APK is signed with Expo's default debug key. That is fine for installing on your own phone.

## Providers and access tokens

The app is in one provider mode at a time. Switch with the provider button at the top left of the Projects screen. Each provider keeps its own token, and removing one never touches the other.

### GitLab

1. In GitLab open Preferences → Access tokens.
2. Create a classic personal access token or a project access token with the `api` scope. The scope is required to create pipelines.
3. Paste it into the app when it asks. It is stored only in the device's secure storage and stays until you remove it in Settings.

Do not use a pipeline trigger token (it cannot read anything). Avoid fine-grained tokens: they fail with `insufficient_granular_scope` on this instance.

The base URL defaults to `https://gitlab.niftycoders.net/api/v4` and can be changed in Settings.

### GitHub (github.com)

Create a classic personal access token under Settings → Developer settings → Personal access tokens with the `repo` and `workflow` scopes. If your repositories belong to an organization that uses SSO, authorize the token for that organization. There is no base URL to set.

### Running GitHub workflows

The app lists every workflow file on the branch, but it can only start the ones with a `workflow_dispatch` trigger. Workflows without it are shown dimmed with the note "No manual trigger". Inputs come from the workflow file:

```yaml
on:
  workflow_dispatch:
    inputs:
      environment:
        description: Target environment
        type: choice
        options: [staging, production]
        default: staging
      debug:
        type: boolean
```

`choice` and `boolean` inputs get a picker, everything else is a text field. GitHub accepts at most 25 inputs per run.

## Project structure

```
src/api         GitLab and GitHub clients, error mapping, API calls
src/providers   CiProvider abstract class and the GitLab and GitHub implementations
src/components  Reusable UI components
src/hooks       Shared stateful logic
src/navigation  Navigator and route types
src/screens     One file per screen
src/storage     Secure storage access
src/theme       Colors, fonts, status styles (Tailwind via twrnc)
```

Coding rules are in `DEVELOPMENT.md`.

## Troubleshooting

- **App does not open from Expo Go:** start with `npm start` (it uses `--localhost`) and keep the phone connected by USB with debugging on. Check `adb devices` lists the phone.
- **Can't reach GitLab:** the instance may only be reachable on the company network. Connect to the VPN and try again.
- **Certificate errors:** if the company uses an internal certificate authority, install the CA certificate on the phone (Android: Settings → Security → Encryption and credentials → Install a certificate → CA certificate). The app never disables certificate checks. Expo Go may ignore user-installed CAs, so if the error stays, use the dev build (`npm run android`).
- **Name and icon do not change:** they only apply to a build (`npm run android` or `npm run apk`), never inside Expo Go.
