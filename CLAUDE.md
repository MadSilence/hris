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
  - feedback/ → EmptyState, ErrorBoundary (see Known Issues)
- features/ → **legacy/orphan area — do not use as a reference or add new code here**
- lib/ → utilities (cn, env, fetcher)
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

# Server Actions

- Always return:
  { status, data?, errorMessage? }

- Never throw raw errors to UI
- Handle errors gracefully
- Use `"use server"` directive

---

# Known Issues — Do Not Copy These Patterns

The following areas are incomplete or inconsistent. Do not use them as references:

- **`features/` directory** — `features/accounts/` is an orphan module. It bypasses `InternalApiClient`, uses raw `fetch`, has no skeleton
  loader, and its `AccountCard.tsx` is empty. The folder name even has a typo (`componenets/`). Ignore it entirely.
- **Mock data in containers** — `CompanyProfileSettingsContainer` and `CompanyAppearanceSettingsContainer` render hardcoded mock objects
  instead of real API data. Do not copy this pattern.
- **Duplicate roles folders** — `components/modules/settings/modules/roles/components/` contains both `RoleDetailsComponent/` and
  `RoleDetailsContainer/`. The active implementation is `RoleDetailsContainer/`. Do not copy from `RoleDetailsComponent/`.
- **`ErrorBoundary.tsx` is currently empty** — `components/feedback/ErrorBoundary.tsx` has no implementation. Containers that do
  `if (error) throw error` have no boundary catching them. Until this is fixed, prefer surfacing errors inline rather than throwing.
- **Stub UI actions** — Some dropdown items (e.g. "Duplicate", "Archive" in public holidays) have no handlers. Do not copy these as working
  examples.
- **Leftover `console.log`** — Several production files contain debug logs (`PersonalInfoContainer`, `PersonalDocumentsContainer`,
  `DepartmentsPage`, `AssignedUsersTable`). Do not add new ones.

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

1. Create API method (via `InternalApiClient`)
2. Create React Query hook (`useQuery` / `useMutation`)
3. Use in container
4. Connect UI
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
