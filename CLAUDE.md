# Frontend Project Overview

This is the frontend of a SaaS HRIS application.

Tech stack:

- Next.js (App Router)
- React (Server + Client Components)
- TypeScript
- TanStack Query (feature modules)
- SWR (auth/user/company providers — legacy global state)
- Desact UI (Radix-based components)
- Tailwind utility classes

Architecture:

- Pages (routes) are thin and mostly compose containers
- Business logic lives in hooks and server actions
- UI is built using reusable components from Desact
- Data fetching is done via custom API client + React Query or SWR (see below)
- Server actions return:
  { status: "SUCCESS" | "ERROR", data?, errorMessage? }

---

# Core Principles

- Prefer existing patterns over creating new abstractions
- Keep components small and focused
- Do not introduce new UI libraries
- Avoid unnecessary re-renders or overuse of state
- Keep styling consistent with existing Tailwind conventions
- Minimize changes — avoid touching unrelated files

---

# Project Structure (important mental model)

- app/ → routes (Next.js App Router)
- components/
  - ui/ → base reusable components (Desact-based)
  - modules/ → domain modules (settings, organization, etc.) ← **follow this for new features**
  - layout/ → layout components (Sidebar, SettingsPageHeader, etc.)
  - auth/ → PermissionGate, PermissionsContext, AccessDenied
  - providers/ → global providers (auth, permissions, etc.)
  - hooks/ → global hooks (useCurrentUser, useUser)
  - clients/ → InternalApiClient (typed HTTP wrapper)
  - ui/Canvas → shared canvas states for the org-structure screens (`CanvasLoading`, `CanvasMessage`)
- lib/ → shared utilities (`cn`, `date`, `formatBytes`)
- models/ → domain TypeScript types
- api/ → server-side HRIS API client

---

# Data Fetching

## Feature modules → TanStack Query

All new feature code should use TanStack Query:

- `useQuery` for reads
- `useMutation` for mutations
- Centralize query keys per module (e.g. `publicHolidaysQueryKeys.ts`)
- Expose cache invalidation as a standalone hook (e.g. `useInvalidatePublicHolidaysQuery`)
- Do not fetch data directly inside components if a hook exists

## Global providers → SWR (legacy)

The auth/user/company providers (`CurrentUserProvider`, `CompanyDataProvider`, `UserProvider`, `useCurrentUser`, `useUser`) use SWR. Do not
migrate or change these unless specifically tasked. Do not mix `swr.mutate` with TanStack Query cache.

---

# API Communication — Canonical Paths (source of truth)

The frontend talks to the Java backend (`hris-api`) through a BFF layer in `api/`. The BFF is a
translator, **not** the source of truth — Java owns the data and the authorization.

## The seam: `service`

Everything **at or below the service is shared** by every transport; everything **above the service
is transport-specific**. Business logic, DTO↔model mapping, and multi-call composition live in the
**service** and nowhere else.

```
  RSC (page.tsx) ─────────────────────────────┐  (direct call, no HTTP)
  client mutation ─▶ server action ────────────┤
  client read ─▶ InternalApiClient ─▶ route.ts ─▶ controller ─┤
                                    ══════════ SEAM ══════════
                                    hrisApi<Domain>Service   ← business logic / mapping / envelope
                                            hrisApi<Domain>Client   ← domain URLs + DTOs
                                            hrisApiClient (base)    ← transport, Bearer, authn, error-shape
                                                    Java (hris-api)
```

**Always present (shared trunk, below the seam):**
- `hrisApiClient` (base) — one per app. Transport to Java, cookie→Bearer, auth-token check, error
  normalization. Cross-cutting authn/error handling lives HERE, so every path inherits it for free.
- `hrisApi<Domain>Client` — one per domain. Knows backend URLs + DTOs only. No business logic.
- `hrisApi<Domain>Service` — one per domain. The convergence point of all transports.

**Transport-specific (above the seam):**
- **Route handler + `*Routes` controller** — exists **only for client-component reads**.
- **`InternalApiClient`** — the **only** browser→`/api` client for reads. Maps HTTP → typed
  exceptions and dispatches `hris:forbidden`. Never use raw `fetch` to hit `/api`.
- **Server action (`"use server"`)** — exists **only for mutations**. It *replaces* the
  InternalApiClient + route.ts + controller trio; a mutation goes `action → service` directly.

## Transport by purpose (not by domain)

| Scenario | Canonical path |
|----------|----------------|
| Mutation (create/update/delete) | **server action** → service → client → base. Returns `{status, data?, errorMessage?}` |
| Read from a client component | **route handler** + `InternalApiClient` + react-query `useQuery` |
| Read from an RSC (server component) | **service directly** (no HTTP, no action) |
| Binary / streaming (documents up/download) | route handler (only transport that can stream) |
| Auth cookie flows (login/logout/register/impersonate) | route handler (must set cookies) |

**Guard (`apiRequestWrapper` = auth + error-shaping):** every route handler should be wrapped with it
**except** deliberately-bespoke ones, which stay bare by design: auth cookie flows, `health`, and raw
proxies that need custom passthrough (`me/access` — ETag/304, `documents/.../upload` — streamed
multipart). New route handlers default to wrapped.

## Security model (do not add a third check)

- **UI gating** (`PermissionGate`, hide/disable buttons) = **UX only, zero security**. Action and
  route endpoints are publicly reachable; a crafted request bypasses the UI entirely.
- **Authentication** (valid token) = cheap fail-fast in the base client. Not authorization.
- **Authorization** (may this user do this action) = **Java `AccessEngine` only — the single security
  boundary.** A server action running "on the server" does NOT authorize its caller.
- Do **not** enforce privileges in the BFF layer. A second copy of the permission model drifts from
  Java. The gating pair is `PermissionGate` (UX) + Java (enforcement) — nothing in between.

---

# Server Actions

- Used for **mutations** (see canonical paths above). Go `action → service` directly — do not add a
  route handler for a mutation.
- Always return `{ status, data?, errorMessage? }` — **never throw to the UI**. Throwing belongs in
  the react-query hook that wraps the action, not in the action itself (see
  `audience/assignment/hooks/useAssignment.ts` — `unwrap()` turns an ERROR envelope into a rejected
  mutation, which is what react-query needs).
- **Do not write your own `catch`.** `lib/errors/withActionError` is the middle for mutations, the
  mirror of `withErrorMiddleware` on the read path. Wrap the body, or call `toActionError(error)`
  from a catch that has to exist for another reason:

```ts
export const archiveOfficeAction = withActionError(
  (input: ArchiveOfficeActionInput) => officeService.archive(input),
);
```

- The envelope it returns is the old one plus `code`, `fieldErrors` and `requestId`. The extra
  fields are optional, so a caller that only reads `status` and `errorMessage` keeps working.
- **Never write a user-facing sentence in an action.** `errorMessage` is filled from
  `lib/errors/errorMessages` by the backend's error code; the backend's own `message` is technical
  and is not shown. Adding an error: `DECISIONS.md` → "Как заводится новая ошибка".

---

# Known Issues — Do Not Copy These Patterns

The following areas are incomplete or inconsistent. Do not use them as references:

- **Dead export buttons.** `Export policies` in `TimeOffPoliciesSettingsComponent` has no `onClick`,
  and the Download button in `AssignedUsersPanel` renders even when the caller passes no `onExport`
  (public-holiday calendars). Do not copy either as a working example.
- **Two components named `DeleteUserAvatarModal`.** The shared one was deleted in the cleanup; the
  live one is declared **inside** `UpdateUserAvatarModal.tsx`. Do not add a second component with the
  name of an existing one — module resolution will not warn you.
- **A file and a folder with the same name shadow each other.** `models/userTable.ts` won over
  `models/userTable/` (both declared `ColumnItem`); the folder was unreachable and is gone. TypeScript
  resolves the file first and says nothing.

Fixed by the cleanup of 2026-08-25 and no longer true (kept here so the entries are not re-added):
the `features/` orphan directory, mock data in `CompanyProfileSettingsContainer`, the duplicate
`RoleDetailsComponent/` folder, leftover `console.log`, and the Duplicate/Archive stubs in public
holidays.

---

# Conventions Confirmed by the 2026-08-25 Cleanup

- **Imports go through the folder when it has an `index.ts`.** 460 imports already do; the barrels
  that were missing or empty have been filled in. Do not import a file directly past an existing
  barrel, and do not leave an `index.ts` empty — an empty barrel makes `import … from "@/…/Folder"`
  silently resolve to nothing.
- **Binary upload/download is a server action + BFF service.** There is no route-handler layer for
  avatars or the company logo; the ones that existed were never wired to a `route.ts` and were
  removed. (Document up/download is the exception and keeps its route handler — it streams.)
- **Holiday days are read as a list and written a whole year at a time.** Per-day
  create/update/rename/delete was removed on both sides of the stack; use
  `replacePublicHolidayYearAction`. See `(claude)/technical_documentation/PUBLIC_HOLIDAYS.md` — step 5.
- **Shared helpers live in `lib/`.** `lib/date.ts` (`dateToISO` / `isoToDate` / `partsToISO` — all
  local-time, never `toISOString()`), `lib/formatBytes.ts`, `models/timeOff/formatDayAmount.ts`.
  Check there before writing another one-line formatter.
- **`@typescript-eslint/no-unused-vars` is an `error`.** A binding that is deliberately unused gets a
  leading underscore.

---

# Showing a failure

The rule is in `DECISIONS.md` → "Ошибки — единая политика". In practice:

| What happened | Where it goes |
|---|---|
| Input the user can fix | `<FormError>` inside the form — it stays open, with what was typed |
| A refusal on an action whose dialog has closed | `showError(error)` / `showActionError(result)` — the sliding card |
| A read that failed (a list, a panel, a tab) | `<ErrorState error={error} />` in the region that did not load |
| A 403 on a whole page | `<AccessDenied/>` |
| Anything thrown during render | `app/(app)/error.tsx`, or `<ErrorBoundary>` around a subtree |

Two things that are easy to get wrong:

- **Validation never goes in a card.** It belongs next to its field; a card slides away before the
  reader works out which field it meant.
- **An early `return` for an error must sit below every hook.** React counts hooks per render, so an
  error return above them changes the count and breaks their order. `PeopleTableContainer` carries
  the comment that explains it.

---

# UI / UX Patterns

## Modals

- Always use Dialog (Desact / Radix)
- Support:
  - ESC to close
  - ENTER to submit
- If form is dirty → show confirm cancel modal using `ConfirmCancelModal`

## Forms

- Use **Formik + Yup** — these are the dominant patterns in this codebase
- Keep validation simple and consistent
- Show clear error messages

## Tables / Lists

- Use skeleton loaders during initial fetch
- Keep layout stable during loading
- Avoid layout shift

## Settings Pages

- Always use:
  - `SettingsPageHeader`
  - `PageDescription` (where present in nearby modules)
- Keep consistent spacing (`px-6` / `px-8`, proper vertical rhythm)
- **Placement of `SettingsPageHeader`** varies: some modules render it inside the presentational Component, others place it directly in the
  `app/` page file. When unsure, inspect the closest similar settings module and match its placement.

---

# Styling Rules

- Use Tailwind utility classes. Avoid inline styles.
- Keep `className` readable (no excessive chaining).
- Match the existing module's approach: most modules use Tailwind exclusively. Some older modules (`attributes`, `jobcatalog`, `PeopleTopbar`) use `.module.css` alongside Tailwind.
- Do not create new `.module.css` files unless the target module already uses CSS modules and there is a strong reason.
- If a component uses `.module.css` but can be reasonably migrated to Tailwind during the task, prefer Tailwind.
- Before building new UI, inspect nearby modules and match their spacing, borders, typography, hover states, rounded corners, and layout style.
- Do not introduce new visual language or redesign patterns unless explicitly requested.

---

# Testing

- Use Jest + React Testing Library
- Prefer testing behavior, not implementation
- Mock:
  - useMutation
  - useQueryClient
  - server actions
- **No `any`, in tests either.** `test/types.ts` covers the usual mock boundaries:
  `CapturedReactQueryOptions` (the options a hook hands react-query), `MockedFormProps` (a form
  double), and `partialMock<T>({...})` for a stand-in that fills in only the fields under test —
  unlike `any` it still checks the fields you do write.
- Build fat request/response fixtures from `test/fixtures/` rather than inline literals. Types like
  `CreateTimeOffPolicyRequest` carry ~25 required fields and grow; inline copies rot silently.
- `jest.mock("<path>")` must name the **same specifier the test imports from**. A near-miss (casing,
  a missing path segment) silently applies no mock and the suite fails somewhere unrelated.

---

# Before Making Changes

When working on a task:

1. Find a similar **working** implementation in `components/modules/` (not `features/`)
2. Reuse the same structure and patterns
3. List files to be changed
4. Keep changes minimal and localized

---

# When Making Changes

- Do NOT refactor unrelated code
- Do NOT rename public APIs
- Follow existing naming conventions
- Keep diffs small

---

# After Making Changes

- Summarize what was changed
- List affected files
- Suggest test commands if relevant

---

# Performance / Cost Awareness

- Do not scan the entire repository unless necessary
- Prefer reading only relevant files
- Use existing docs (CLAUDE.md, docs/ai/*) first

---

# Common Workflows

## New Settings Page

1. Create route in `app/`
2. Add `SettingsPageHeader` + `PageDescription` (check a nearby module for placement)
3. Create container component in `components/modules/settings/modules/<domain>/`
4. Add hooks / actions if needed (TanStack Query)
5. Add UI components
6. Add tests

## New Modal

1. Use Dialog
2. Add Formik form with Yup schema
3. Handle dirty state with `ConfirmCancelModal`
4. Connect mutation via `useMutation`

## Data Feature

1. Pick the transport per the **API Communication — Canonical Paths** section:
   - read → route handler + `InternalApiClient`; mutation → server action (`action → service`)
2. Add the BFF pieces below the seam if missing (`hrisApi<Domain>Service` → client → base)
3. Create React Query hook (`useQuery` for reads / `useMutation` wrapping the action)
4. Use in container, connect UI
5. Handle loading + error + empty states

---

# Important Constraints

- Do not introduce new dependencies
- Do not break existing UI patterns
- Do not bypass `InternalApiClient` with raw `fetch` in feature modules
- Always match existing architecture in `components/modules/`

---

# If Uncertain

Ask:

- "Is there an existing pattern for this?"
- "Should I follow an existing module?"

Check a known-good reference module (e.g. `publicHolidays`, `legalEntity`, `roles/RoleDetailsContainer`) rather than an incomplete one.

Never invent a completely new pattern without checking.

---

# Good Reference Modules

Prefer copying patterns from:

- publicHolidays → best example of full feature (queries, mutations, UI)
- legalEntity → good settings page structure
- roles/RoleDetailsContainer → complex module with modals and tables

Avoid using incomplete modules as reference.

---

# Git / Branching Rules

- Always work directly on the `main`/`master` branch.
- Do not create new branches.
- Do not switch to feature branches.
- Do not create merge requests or pull requests.
- Do not commit automatically — only commit when explicitly asked.
- Before editing, check the current branch and report it.
- If not on `main`/`master`, ask before switching, or switch only if explicitly instructed.

---

# UI / Styling Direction

- Follow the current UX/UI of the existing application. Do not redesign.
- Before creating new UI, inspect nearby modules and match their spacing, borders, typography, hover states, rounded corners, and layout style.
- Prefer Tailwind utility classes.
- Do not create new `.module.css` files unless the target module already uses CSS modules and there is a strong reason.
- If a component uses `.module.css` but can be reasonably migrated to Tailwind during the task, prefer Tailwind.
- Do not introduce new visual language or redesign patterns unless explicitly requested.
