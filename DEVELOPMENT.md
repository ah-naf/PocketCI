# Development Rules

Every ticket and every code change follows these rules.

## Code style
- Simple code. Prefer the smallest change that fully solves the task (ponytail approach).
- KISS: no abstraction until two real call sites need it.
- DRY: shared logic lives in one place (`gitlabClient.ts`, shared components, hooks). Copy-paste across screens is a bug.
- No function longer than 100 lines. Split long screens into small components and hooks.
- Function, variable, component, and file names are valid, descriptive, and honest: verbs for functions (`fetchBranches`, `formatDuration`), nouns for components (`StatusBadge`), `useX` for hooks. No abbreviations, no single-letter names except short loop indexes.
- No unnecessary comments. Code explains itself through names. Comment only a non-obvious reason (for example a GitLab API quirk).
- No dead code, no unused imports, no commented-out code, no `console.log` (never log the token).

## Components
- Build every UI piece as a reusable component in `src/components` (`Button`, `Input`, `StatusBadge`, `ListRow`, `Section`, `Picker`).
- One component, one job. Configure it through typed props. Do not hardcode screen data inside it.
- Before writing markup in a screen, check `src/components` for an existing component. Extend its props instead of copying it.
- Same visual pattern used twice means one shared component.
- Components hold no API calls or storage access. Screens and hooks fetch data and pass it down.
- Keep props small and named for meaning (`label`, `onPress`, `status`), not for looks. Style variants use a `variant` prop.
- Each component lives in its own file named after it (`StatusBadge.tsx`) with one default or named export.

## Dependencies
- Keep the app small. Add a package only when a small helper cannot do the job, and say why in the ticket.
- Allowed set: `expo`, `react-native`, React Navigation (native-stack), AsyncStorage, `expo-secure-store`, `expo-clipboard`, `yaml`, `twrnc`.

## Structure
- `src/api`: GitLab calls only. All HTTP goes through `gitlabClient.ts`.
- `src/screens`: one file per screen, composition only.
- `src/components`: shared UI pieces.
- `src/hooks`: shared stateful logic (`usePoll`, `usePaginated`).
- `src/storage`: SecureStore and AsyncStorage access.
- `src/theme`: Tailwind config, colors, fonts.
- `src/utils`: small helpers (formatting, log parsing, dialogs).

## Security
- Token lives only in `expo-secure-store`. Never in AsyncStorage, URLs, logs, or source.
- Never disable TLS checks.

## Types and quality
- TypeScript strict mode. No `any`; use `unknown` and narrow.
- Run `npx tsc --noEmit` after every step. It must pass before the ticket is done.
- No automated tests (project decision). Each ticket has a manual test checklist.

## UI
- Tailwind classes via `twrnc` only. No inline style objects except dynamic values.
- Follow the "ops console" design direction (frontend-design skill). No generic default look.
- Every screen supports light and dark mode, loading, empty, and error states.
