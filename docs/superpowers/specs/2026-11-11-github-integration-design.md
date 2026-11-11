# GitHub integration design

## Intent

The app today manages GitLab pipelines from a phone: browse projects and branches, fill in run inputs, start a pipeline, watch it, read job logs, cancel it. The owner also uses github.com and wants the same experience for GitHub Actions in the same app, without duplicating screens or branching on the provider all over the code.

The approach the owner chose: one abstract class that both GitLab and GitHub implement. Screens talk only to that class. Everything that differs between the two services lives inside each implementation.

## Goals

- Same flow on GitHub as on GitLab: pick a repo, pick a branch, fill inputs, run, watch the run and its jobs, read job logs, cancel, plus recent runs, recent repos, search and paging.
- Screens never check which provider is active. They read differences from the provider (labels and capability flags), never `if (provider === 'github')`.
- The existing GitLab behavior is unchanged after the refactor.
- Adding a third provider later means writing one more subclass, no screen changes.

## Non-goals

- GitHub Enterprise or any GitHub address other than github.com.
- GitLab projects and GitHub repos in one combined list. The app is in one provider mode at a time.
- Running workflows that have no `workflow_dispatch` trigger. They are listed but not runnable.
- Job-level cancel on GitHub (the API has none).
- Creating or editing workflow files.
- Automated tests (project decision, unchanged).

## Anti-goals (a failure even if it technically works)

- A wide abstract class that mostly passes calls through, or screens full of provider checks.
- Any change to GitLab behavior, UI, or stored data that the owner would notice.
- Any token written to logs, URLs, AsyncStorage, or source. Tokens stay in expo-secure-store only.
- A GitHub screen flow that feels different from the GitLab one without a GitHub-imposed reason.

## Constraints

- Follow `DEVELOPMENT.md`: small functions (under 100 lines), DRY and KISS, reusable components, no new package unless justified, no needless comments.
- UI follows the existing Claude Design canvas and the ops-console theme. New GitHub-only UI (workflow picker) should reuse existing components and look like the rest.
- Expo, React Native, TypeScript, twrnc, React Navigation. No backend.
- `yaml` is already a dependency and is used to parse workflow files.

## Decisions made by the owner

1. Both providers implement the same abstract class.
2. One provider is active at a time; the owner switches between them.
3. GitHub means github.com only.
4. List every workflow, but only workflows with `workflow_dispatch` can be run.
5. When a run starts and GitHub gives no run id, wait up to about 15 seconds for the new run to appear, then open it. If it does not appear, show it in Recent runs.
6. Parity with GitLab: the same features for GitHub.

## Verified and unverified GitHub facts

Verified in GitHub's docs:

- Workflow list: `GET /repos/{owner}/{repo}/actions/workflows`. Fields: `id`, `name`, `path`, `state`. This list reflects the default branch.
- Run list: `GET /repos/{owner}/{repo}/actions/runs`, filterable by `branch`, `event`, `status`. `per_page` max 100, `page` based. Results are capped at 1,000 when filtering by `branch`.
- Jobs of a run: `GET /repos/{owner}/{repo}/actions/runs/{run_id}/jobs`. Job fields: `id`, `name`, `status` (queued, in_progress, completed, waiting, requested, pending), `conclusion` (success, failure, neutral, cancelled, skipped, timed_out, action_required, or null), `started_at`, `completed_at`, `steps`.
- Job log: `GET /repos/{owner}/{repo}/actions/jobs/{job_id}/logs` returns a 302 redirect to a plain-text file. The link expires after 1 minute.
- Cancel a run: `POST .../actions/runs/{run_id}/cancel` returns 202, or 409 if it cannot be cancelled. A force-cancel endpoint exists.
- Re-run: `POST .../actions/runs/{run_id}/rerun`, `.../rerun-failed-jobs`, and `.../actions/jobs/{job_id}/rerun` (201).
- Dispatch: `POST .../actions/workflows/{workflow_id}/dispatches` with `ref` and optional `inputs` (max 25). The docs now describe a 200 response containing `workflow_run_id`, `run_url`, `html_url`. A GitHub changelog dated 2026-02-19 says run ids are now returned, and a secondary source says a `return_run_details` option controls it, with 204 and no body otherwise.

Not verified. Spike these with the owner's real token before building the parts that depend on them:

- Whether dispatch returns the run id by default or only when `return_run_details` is requested, and where that option goes in the request. Decision 5 (the 15-second wait) stays as the fallback either way.
- Whether the log endpoint returns usable partial output for a job that is still running. This decides if live log following works on GitHub.
- Whether workflows that exist only on a feature branch (not the default branch) can be listed and dispatched. The workflow list endpoint reflects the default branch, so the branch-specific list probably has to come from the repo contents API at the selected ref.
- Which token types work: a classic token (`repo` and `workflow` scopes) is expected to work. A fine-grained token needs Actions read and write plus Contents read. The owner's GitLab instance had trouble with fine-grained tokens, so confirm for GitHub too.

## The abstract class

One abstract class, `CiProvider`. Its interface is small and speaks in shared types. GitLab and GitHub map to those types inside their own implementations.

Shared types (names are suggestions):

- `ProjectRef`: provider id, a stable key (GitLab numeric id as text, GitHub `owner/repo`), display name, path. Navigation parameters carry a `ProjectRef`.
- `RunStatus`: the existing set the UI already understands: `created`, `pending`, `running`, `success`, `failed`, `canceled`, `skipped`, `manual`, `waiting_for_resource`, `canceling`. GitHub's status plus conclusion is mapped into it (for example `queued` becomes `pending`, `in_progress` becomes `running`, `completed` with `failure` or `timed_out` becomes `failed`, `cancelled` becomes `canceled`, `action_required` becomes `manual`). This keeps the status badge and colors untouched.
- `RunOptions`: what the Branch screen needs to render the run form. A list of run targets, each with `id`, `name`, `runnable`, an optional reason it is not runnable, and `inputs`. Plus `allowCustomInputs` and a list of notices (lint errors, "include files not resolved"). GitLab returns a single target and allows custom inputs. GitHub returns one target per workflow, forbids custom inputs, and marks workflows without `workflow_dispatch` as not runnable.
- `RunInput`: `key`, `label`, `defaultValue`, `kind` (text, choice, boolean), optional `options`.
- `Run`, `RunSummary`: id, status, ref, short commit, created/started/finished times, duration, web address, and a display name.
- `Job`: id, name, `group` (GitLab stage; on GitHub a single group named after the workflow), status, duration, started time, web address.
- `LogChunk`: cleaned text, an opaque `cursor`, and whether the text replaces or appends. GitLab uses a byte offset as the cursor. GitHub has no ranges, so it always replaces.

Methods (the builder may merge or rename):

- Identity and presentation: `id`, `labels` (what to call a project, a run, a branch action; "Pipeline" versus "Workflow run"), `capabilities`.
- `capabilities` flags: `cancelJob`, `liveLogs`, `rangeLogs`, and others the builder finds needed. Screens read these to show or hide controls.
- Account: `verifyCredentials` returns the signed-in user name.
- Browse: `listProjects(query, page)`, `getProject(key)` (default branch), `listBranches(project, query, page)`.
- Run: `getRunOptions(project, branch)`, `startRun(project, branch, targetId, inputs)` returning a run reference, `listRuns(project, branch)`, `getRun(project, runId)`, `listJobs(project, runId)`, `getJob(project, jobId)`.
- Logs: `readLog(project, jobId, cursor)`. Each provider also cleans its own raw log text (GitLab timestamp prefixes and section markers today, GitHub per-line timestamps and `##[group]` markers).
- Control: `cancelRun(project, runId)`, optional `cancelJob(project, jobId)`.

Depth check: this is about 15 methods, which is wide. It is acceptable because each method does real provider work (requests, paging, mapping, parsing). The builder should still look for methods to merge, for example one method for project plus default branch.

## What differs between the providers

| Area | GitLab | GitHub |
|---|---|---|
| Auth | `PRIVATE-TOKEN` header, editable base URL | `Authorization: Bearer`, fixed `https://api.github.com`, token only |
| Project list | `/projects?membership=true`, `x-next-page` header | `/user/repos`, `Link` header |
| Run options | CI variables from lint, with raw file fallback | workflow files, `workflow_dispatch` inputs parsed with `yaml`, read per branch |
| Run unit | one pipeline per branch | many workflows per repo, pick one |
| Run id after start | returned | possibly returned, otherwise found by polling |
| Stages | yes | no, one flat group |
| Logs | live with Range requests | whole file each time, live behavior unverified |
| Cancel | run and job | run only |
| Terms | pipeline, project | workflow run, repository |

A note for the builder: `yaml` v2 parses the key `on` as a string, which is what the workflow files need. Confirm this during the work.

## Storage changes

- Tokens: keep the existing GitLab token and base URL keys unchanged so the current install keeps working. Add a separate GitHub token key. The GitHub base URL is not stored.
- Add the active provider id (secure or normal storage, builder decides; it is not secret). The last used provider is restored on launch.
- Recent projects are kept separately per provider. The existing list belongs to GitLab and must migrate without losing data.
- Theme is unchanged.

## UI changes

- Projects screen: a provider switch control in the header (for example next to the theme and Settings icons). Switching reloads the list, recents and search for that provider.
- Setup and Settings: configure each provider. GitLab keeps its URL and token fields. GitHub shows only a token field and its scope hint. A provider with no token opens its setup first.
- Branch screen: becomes provider driven. GitLab keeps today's form. GitHub adds a workflow picker above the inputs. Workflows without `workflow_dispatch` are listed greyed out with a short reason. Choice and boolean inputs use the existing picker component, text inputs use the existing input.
- Recent runs on GitHub show every workflow's runs on the branch, each with the workflow name.
- Run screen and Job log screen: the same screens for both. Labels and visible actions come from the provider. "Cancel job" is hidden when `cancelJob` is false.
- No screen contains a provider-name check.

## Delivery order

1. Spike (small, throwaway): with the owner's real GitHub token, confirm the four unverified facts above. Report the answers before the dependent work starts.
2. Refactor: introduce `CiProvider` and the shared types, move all current GitLab code behind a `GitLabProvider`, make screens use the provider. No visible change. This is the point where the existing GitLab flow is re-tested end to end.
3. Provider switching and credentials: active provider, per-provider token storage, Settings and Setup changes, per-provider recents and migration, the switch control.
4. GitHub read path: repos, branches, runs, run detail, jobs, logs.
5. GitHub run path: workflow list with `workflow_dispatch` detection, input parsing, dispatch, run id handling, cancel, re-run if wanted.

Each step ends with `npx tsc --noEmit` passing and a manual test list, as in the earlier tickets.

## Left to the builder

- Exact method names, grouping and file layout, as long as screens depend only on the abstract class.
- Whether `getProject` and `listBranches` merge, how to name capability flags, and how paging is shared.
- How the GitHub log text is cleaned and shown, and whether a manual refresh button replaces live follow if live logs are not possible.
- Where to store the active provider.
- Whether to include re-run and re-run-failed on both providers in this work or as a follow-up.

## Calls made by the designer (not decided by the owner)

These were settled while writing, so the owner can overrule them.

- **Status mapping gaps:** a GitHub `neutral` conclusion maps to `success`, `skipped` stays `skipped`, `timed_out` maps to `failed`, `action_required` maps to `manual`, and `waiting` or `requested` map to `pending`. Anything unknown shows as `pending` with its raw name.
- **Finding the new run when no run id is returned:** after dispatch, poll the run list for the chosen workflow with event `workflow_dispatch` on that branch. Accept the newest run created after the dispatch request was sent. Stop after about 15 seconds.
- **Workflow files:** `yaml` v2 reads the key `on` as a string, so `on.workflow_dispatch.inputs` can be read directly. Confirm in the first GitHub step.
- **How screens get the provider:** a small React context created at the app root holds the active provider instance. Screens read it through a hook and never import GitLab or GitHub code.
- **Spec location:** this document lives in `docs/superpowers/specs/` (the brainstorming default) and is not committed yet.
