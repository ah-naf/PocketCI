# PocketCI

Personal React Native (Expo, TypeScript) app for GitLab and GitHub pipelines. No backend. Brief: [IDEA.md](IDEA.md). Tickets: [tickets/](tickets/).

## Rules
- Follow [DEVELOPMENT.md](DEVELOPMENT.md) for every change.
- Use the `ponytail` skill for all coding: smallest change that fully solves the task.
- Use the `frontend-design` skill for all UI work (screens, components, styling).
- Work one ticket at a time, in order. Run `npx tsc --noEmit` after each step.

## Think like a lead engineer before adding code
Answer these first. Skip the edit if any answer says it is not needed.
- Is this change needed for the ticket? If not, do not add it.
- Does the code already exist (component, hook, helper)? Reuse it.
- Is there a simpler way: fewer lines, no new file, no new package?
- Does this belong in a shared place (`gitlabClient.ts`, `src/components`, `src/hooks`) instead of this screen?
- Will it stay under 100 lines per function and follow DRY and KISS?
- Add a package only when a small helper cannot do the job. Name the reason first.
- Ask the user when a requirement is unclear. Do not guess.

## Design
- The UI must match this Claude Design canvas exactly: https://claude.ai/artifact/2HTP7LJSpJt2NxeKhKC36V
- Read it with the Artifact tool `read` action, not WebFetch. Screens live in `project/*.dc.html`; tokens and styles in `project/ops.css` and `project/StyleGuide.dc.html`.
- Take colors, fonts, spacing, radii, status badges and screen layouts from the canvas. Do not invent a new look.
- Implement with `twrnc` classes. Support the dark and light variants shown in the canvas.
