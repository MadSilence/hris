# Frontend MVP Audit Report

> **Date:** 2026-06-14  
> **Branch:** master  
> **Scope:** Frontend only (Next.js App Router, React, TypeScript, TanStack Query)  
> **Purpose:** Assess current frontend readiness against MVP requirements across 4 areas

---

> ## ⚠️ Outdated for Roles & Permissions (as of 2026-07-24)
>
> Everything this report says about **Roles & Permissions** describes an architecture that
> no longer exists. Treat those sections as historical. What is true now:
>
> - `PermissionsContext`, `/me/permissions` and the `can()` / `canModule()` / `canField()`
>   helpers are **deleted**. Access now comes from `GET /me/access` via
>   `components/auth/useAccess.ts` (TanStack Query + ETag/304 + localStorage cache).
> - Permission checks live in `models/access/canAccess.ts`. **Actions are matched literally** —
>   `MANAGE` does *not* imply `EDIT`/`VIEW`; scopes *are* hierarchical (`COMPANY` covers
>   `SELF`/`DIRECT_REPORTS`). This mirrors the backend `EffectiveAccess#can`.
> - Role permissions are read/written through `GET|PUT /roles/{id}/permissions`
>   (full replace) and the matrix editor is **implemented**, not missing.
> - Role CRUD, role assignment to users and removal are wired
>   (`POST /users/{id}/roles/assign|remove` with a `{ roleId }` body).
> - Module-level tables (`ModulesAccessTable`, `AttributeGroupsTable`,
>   `PersonalDataAccessTable`) and `RoleEditor` are **removed**.
>
> Sections about other modules were not re-verified and may also have drifted.

---

## Executive Summary

**What looks ready:**
- People Table — fully functional with real API integration: search, filters, sorting, cursor pagination, bulk selection, dynamic columns. Solid MVP core.
- Roles & Permissions infrastructure — `PermissionsContext`, `PermissionGate`, sidebar filtering, and Role management screens (list, details, create, delete, rename) are implemented and backend-wired.

**What is partially ready:**
- Access by Roles / Permissions — infrastructure is solid, but key flows are broken: role assignment to users has no wired mutation, role permissions cannot be saved, and `AssignedUsers` action handlers are stubs.
- Assignment functionality — the UI scaffolding for role assignment exists (modal, form, table), but submission is not wired and no bulk assignment exists.

**What requires work before MVP:**
- Departments & Teams — 100% client-side mock data, no backend API integration, no CRUD, no user assignment. Both modules are essentially UI prototypes only.

**What depends on backend:**
- Departments & Teams API (no routes or DTOs exist on the frontend side either).
- Role permissions save/update endpoint (PermissionsModule table exists, but no mutation hook).
- Import/Export for People (stub UI only).

---

## MVP Area Status Table

| Area | Status | Confidence | Main Gaps | Key Files |
|------|--------|------------|-----------|-----------|
| Assignment by User Property + Simple Assignment | PARTIAL | Medium | No mutation wired; no bulk assignment; stub remove handlers | `AssignRolesModal`, `AssignedUsersModule`, `UsersRolesTable` |
| Access by Roles / Permissions | PARTIAL | High | Role assignment mutation not connected; permission save not implemented; Departments/Teams pages unprotected | `PermissionsContext`, `PermissionGate`, `RoleDetailsContainer` |
| Departments and Teams | MISSING | High | 100% mock data; no API; no CRUD; no user assignment | `DepartmentsContainer`, `TeamsContainer` |
| People Table UI + Access Improvements | PARTIAL | High | No add/import/export; no user detail link; no bulk actions UI; no access integration | `PeopleTableContainer`, `usePeopleSearch` |

---

## Detailed Analysis

---

### 1. Assignment by User Property + Simple Assignment

#### Current State

Assignment is partially scaffolded within the **Roles** module. The only assignment flow visible in the codebase is **role assignment to users** (admin assigns roles to a user). There is no general-purpose assignment infrastructure (no user picker, no department assignment UI).

#### Existing Screens

- **`/settings/people/roles`** — "Users" tab shows `UsersRolesTable` with all users and their current roles. Clicking a row opens `AssignRolesModal`.
- **`/settings/people/roles/[id]`** — Role details page has an `AssignedUsers` panel showing users assigned to that role.

#### Components

| Component | Path | State |
|-----------|------|-------|
| `UsersRolesTable` | `components/modules/settings/modules/roles/components/RolesPageContainer/modules/UsersRolesTable/UsersRolesTable.tsx` | Renders users + roles, click to open modal |
| `AssignRolesModal` | `.../UsersRolesTable/modals/AssignRolesModal/AssignRolesModal.tsx` | Opens modal — connects form |
| `AssignRolesForm` | `.../UsersRolesTable/modals/AssignRolesForm/AssignRolesForm.tsx` | Checkboxes for roles — **submission not wired** |
| `AssignedUsersModule` | `components/modules/settings/modules/roles/components/RoleDetailsContainer/modules/AssignedUsers/AssignedUsersModule.tsx` | Shows users per role — action handlers are stubs |
| `AssignedUsersTable` | `.../AssignedUsers/AssignedUsersTable.tsx` | Table rows — has debug `console.log` |

#### Hooks / Services

| Hook / Service | Path | State |
|----------------|------|-------|
| `usePeopleSearch` | `components/modules/organization/hooks/usePeopleSearch/usePeopleSearch.ts` | Working — TanStack Query, `POST /users/search` |
| `useRoles` | `components/modules/settings/modules/roles/hooks/useRoles.ts` | Working — TanStack Query, `GET /roles` |
| `hrisUserRolesService` | `api/modules/roles/services/hrisUserRolesService/hrisUserRolesService.ts` | Has `getUserRoles`, `assignRole`, `removeRole` — not exposed via React Query mutations |

#### API Integration

- `POST /users/search` — used in `usePeopleSearch` ✅
- `GET /roles` — used in `useRoles` ✅
- `POST /roles/{userId}/assign` — backend service exists, **no mutation hook on frontend**
- `DELETE /roles/{userId}/remove` — backend service exists, **no mutation hook on frontend**

#### Mock Data / Placeholders

- `AssignedUsersModule`: `onExport={() => {}}`, `onManageRules={() => {}}`, `onRemoveUser={(userId) => {}}` — all stubs
- `AssignRolesForm`: `onSubmitAction` callback is declared but never connected to a real `useMutation` in the parent

#### Gaps

1. No `useAssignRole` / `useRemoveRole` React Query mutation hooks
2. `AssignRolesForm` submission never triggers a backend call
3. No bulk role assignment (selection exists in `PeopleTable` but no handler)
4. `AssignedUsersModule.onRemoveUser` is a stub — user cannot be removed from a role
5. No user picker / user search component that is reusable outside the roles module
6. No department or team assignment UI anywhere in the codebase
7. No assignment-related DTOs beyond what exists in `UsersSearchItemDTO.roles[]`

#### MVP Recommendation

The UI scaffold is in place. The primary task is wiring mutations:
1. Create `useAssignUserRoles` mutation hook
2. Connect it to `AssignRolesForm` submission
3. Implement `onRemoveUser` in `AssignedUsersModule`
4. Add cache invalidation on success

#### Suggested Next Tasks

- [ ] Create `useAssignUserRoles` mutation hook (wrapping `hrisUserRolesService.assignRole`)
- [ ] Connect mutation to `AssignRolesModal` submit handler
- [ ] Implement `onRemoveUser` flow with confirmation modal
- [ ] Create `useRemoveUserRole` mutation hook
- [ ] Add invalidation of `ROLES_QUERY_KEY` and `usePeopleSearch` after mutations

---

### 2. Access by Roles / Permissions

#### Current State

The permission infrastructure is solid and in production use. `PermissionsContext` fetches real permissions from backend, caches them with ETag in localStorage, and provides `can()`, `canModule()`, `canField()` helpers. `PermissionGate` is used in multiple places. However, key management UI flows are incomplete.

#### Existing Screens

- **`/settings/people/roles`** — Role list + Users table with role assignment UI
- **`/settings/people/roles/[id]`** — Role details with two tabs: "Assigned Users" and "Permissions"

#### Components

| Component | Path | State |
|-----------|------|-------|
| `PermissionsContext` | `components/auth/PermissionsContext.tsx` | Working — ETag cache, `can()`, `canModule()`, `canField()` |
| `PermissionGate` | `components/auth/PermissionGate.tsx` | Working — `anyOf` / `allOf` props |
| `AccessDenied` | `components/auth/AccessDenied.tsx` | Renders 403 page |
| `RolesPageContainer` | `components/modules/settings/modules/roles/components/RolesPageContainer/RolesPageContainer.tsx` | Working |
| `RolesTable` | `.../RolesPageContainer/modules/RolesTable/RolesTable.tsx` | Working — list, create, delete, rename |
| `UsersRolesTable` | `.../RolesPageContainer/modules/UsersRolesTable/UsersRolesTable.tsx` | Renders — assignment not wired (see Area 1) |
| `RoleDetailsContainer` | `components/modules/settings/modules/roles/components/RoleDetailsContainer/RoleDetailsContainer.tsx` | Working |
| `PermissionsModule` | `.../RoleDetailsContainer/modules/Permissions/PermissionsModule.tsx` | Renders tables — **no save mutation** |
| `ModulesAccessTable` | `.../Permissions/ModulesAccessTable.tsx` | Module-level permission grid |
| `AttributeGroupsTable` | `.../Permissions/AttributeGroupsTable.tsx` | Attribute group access |
| `PersonalDataAccessTable` | `.../Permissions/PersonalDataAccessTable.tsx` | Personal data field access |

> **Note:** `RoleDetailsComponent/` in the same folder is an **inactive duplicate** — do not use as reference per CLAUDE.md.

#### Hooks / Services

| Hook | Path | State |
|------|------|-------|
| `useRoles` | `components/modules/settings/modules/roles/hooks/useRoles.ts` | Working — TanStack Query |
| `useRoleModulePermissions` | `components/modules/settings/modules/roles/hooks/useRoleModulePermissions.ts` | Exists — reads permissions for a role |
| `usePermissions` (context) | via `PermissionsContext` | Working — `usePermissions()` hook |

**Server Actions:**
- `DeleteRoleAction` — `components/modules/settings/modules/roles/actions/Role/DeleteRoleAction/DeleteRoleAction.ts` ✅
- `RenameRoleAction` — `components/modules/settings/modules/roles/actions/Role/RenameRoleAction/RenameRoleAction.ts` ✅
- No `UpdateRolePermissionsAction` found

#### API Integration

- `GET /me/permissions` — used by `PermissionsContext` ✅
- `GET /roles` — used by `useRoles` ✅
- `DELETE /roles/{id}` — wired via `DeleteRoleAction` ✅
- `PATCH /roles/{id}` (rename) — wired via `RenameRoleAction` ✅
- `GET /roles/{id}/permissions` — used by `useRoleModulePermissions` (assumption)
- `PUT /roles/{id}/permissions` — **no frontend mutation found**

#### Sidebar Navigation Filtering

`app/(app)/layout.tsx` filters sidebar items using `canModule(item.module, "view")`:
- Organization → requires `PEOPLE` module permission ✅
- Time Off → requires `TIME_OFF` module permission ✅
- Settings section → **no module check** (always visible)

#### Mock Data / Placeholders

- Departments and Teams settings pages have **no `PermissionGate`** — any authenticated user can access them
- `PermissionsModule` tables render read-only UI — no save/edit capability visible

#### Gaps

1. `PermissionsModule` has no save mutation — admin cannot update role permissions via UI
2. Departments/Teams settings pages are not protected by `PermissionGate`
3. Settings section always shown in sidebar regardless of permissions
4. No permission change audit log
5. Role permissions read flow unclear — need to verify `useRoleModulePermissions` fetches from backend

#### MVP Recommendation

Unblock two flows:
1. Wire permission save in `PermissionsModule` (requires backend endpoint + mutation hook)
2. Wrap Departments/Teams pages in appropriate `PermissionGate`

#### Suggested Next Tasks

- [ ] Create `useUpdateRolePermissions` mutation hook
- [ ] Connect it to `PermissionsModule` with a "Save" button
- [ ] Add `PermissionGate` to `/settings/general/departments` and `/settings/general/teams` pages
- [ ] Verify `useRoleModulePermissions` actually fetches from backend (vs. mock)
- [ ] Audit Settings sidebar items for missing permission guards

---

### 3. Departments and Teams

#### Current State

Both modules are **100% client-side mock data prototypes**. They render a hierarchical tree UI with a details panel, but neither module fetches from or writes to any API. This is the largest MVP gap.

#### Existing Screens

- **`/settings/general/departments`** — Departments tree + details panel
- **`/settings/general/teams`** — Teams tree + details panel

#### Components

| Component | Path | State |
|-----------|------|-------|
| `DepartmentsContainer` | `components/modules/settings/modules/departments/DepartmentsContainer.tsx` | Mock only — 174 lines of inline data |
| `DepartmentTree` | (within departments module) | Tree with expand/collapse |
| `DepartmentDetailsPanel` | (within departments module) | Shows name, members, about, founded, responsibilities |
| `TeamsContainer` | `components/modules/settings/modules/teams/TeamsContainer.tsx` | Mock only — ~148 lines of inline data |
| `TeamTree` | (within teams module) | Tree with expand/collapse |
| `TeamDetailsPanel` | (within teams module) | Shows team details |
| `SettingsDepartmentsAndTeamsLayout` | `components/ui/SettingsDepartmentsAndTeamsLayout/SettingsDepartmentsAndTeamsLayout.tsx` | Shared layout for both pages |

#### Hooks / Services

**None.** No hooks, no services, no API client usage.

#### API Integration

**None.** No API routes for departments or teams exist in `app/api/`. No DTOs in `models/`.

#### Mock Data / Placeholders

**All data is mocked.** Located inline in container files:

- `DepartmentsContainer.tsx` lines 8–182: `initialData` constant — hardcoded tree with ~10 top-level departments (Engineering, Product, Design, Customer Success, Sales, Marketing, People, Finance, IT & Security), each with nested children, `members` count, `about`, `founded`, `directReports`, `responsibilities[]`
- `TeamsContainer.tsx` lines 8–148: nearly identical structure with team names

Notable issues:
- Member counts are fictional (e.g., `members: 42`)
- Department and Team trees are near-duplicates of each other
- No real node IDs — uses short slugs like `"eng"`, `"product"`

#### Gaps

1. No backend API (no routes, no service, no DTOs)
2. No CRUD — cannot create, rename, or delete departments/teams
3. No user assignment — cannot assign employees to departments or teams
4. No search or filter
5. No navigation to department/team via URL parameter
6. No real member counts
7. Pages not protected by `PermissionGate`
8. No TanStack Query or SWR data fetching
9. No loading/error/empty states
10. Mock data duplicated between the two containers

#### MVP Recommendation

This requires full implementation from scratch:
1. Define DTOs in `models/`
2. Create API routes in `app/api/`
3. Create TanStack Query hooks
4. Replace mock data with real fetches
5. Implement CRUD modals
6. Connect user assignment

**Complexity: Large.** This is the biggest frontend gap to MVP.

#### Suggested Next Tasks

- [ ] Define `DepartmentDTO`, `TeamDTO`, `DepartmentTreeDTO` in `models/`
- [ ] Create `app/api/departments/` and `app/api/teams/` routes
- [ ] Create `useDepartments` and `useTeams` query hooks
- [ ] Replace `initialData` mock in both containers with real `useQuery` calls
- [ ] Create `useCreateDepartment`, `useUpdateDepartment`, `useDeleteDepartment` mutations
- [ ] Add skeleton loaders to both tree and details panels
- [ ] Implement CRUD modals (create, rename, delete with confirmation)
- [ ] Add `PermissionGate` to both settings pages

---

### 4. People Table UI + Access Improvements

#### Current State

The People table is the most complete MVP feature. It has full real API integration with search, filtering, sorting, cursor pagination, bulk selection, and dynamic column visibility. The core list is production-ready. Key gaps are add/import/export actions and the absence of bulk operations despite selection being implemented.

#### Existing Screens

- **`/organization/people`** — Main people directory, protected by `canModule("PEOPLE", "view")`

#### Components

| Component | Path | State |
|-----------|------|-------|
| `PeopleTableContainer` | `components/modules/organization/components/PeopleTableContainer/PeopleTableContainer.tsx` | Working — state orchestration |
| `PeopleTopbar` | (within PeopleTableContainer) | Working — search, filters, columns |
| `PeopleTable` | (within PeopleTableContainer) | Working — rows, sort, pagination, selection |
| `FiltersBar` | (within PeopleTableContainer) | Working — filter chips |
| `ImportMenu` | (within PeopleTopbar) | Stub — no handler |

#### Hooks / Services

| Hook | Path | State |
|------|------|-------|
| `usePeopleSearch` | `components/modules/organization/hooks/usePeopleSearch/usePeopleSearch.ts` | Working — TanStack Query |
| `useUserFields` | `components/modules/organization/hooks/useUserFields/useUserFields.ts` | Working — field metadata for columns/filters |

#### API Integration

- `POST /users/search` — fully integrated with pagination, sort, filters ✅
- `GET /users/fields` — fetches available fields for column picker and filter menu ✅
- Import endpoint — not connected
- Export endpoint — not connected
- Add/Invite endpoint — not connected

#### Features Status

| Feature | Status |
|---------|--------|
| Search (debounced, server-side) | ✅ Working |
| Filters (multi-operator, server-side) | ✅ Working |
| Sorting (single column, server-side) | ✅ Working |
| Cursor pagination (next/prev) | ✅ Working |
| Column picker (toggle visibility) | ✅ Working |
| Bulk row selection | ✅ Working (UI only) |
| Bulk actions (assign role, etc.) | ❌ Missing |
| Export | ❌ Stub (`onExportAction={() => {}}`) |
| Import CSV | ❌ Stub |
| Add manually | ❌ Stub |
| Invite by email | ❌ Stub |
| User detail page (click row) | ❌ No link |
| People Chart tab | ❌ Tab exists, component missing |
| Column visibility persistence | ❌ Resets on reload |
| Access integration (roles displayed) | ✅ `roles[]` in `UsersSearchItemDTO` |

#### Mock Data / Placeholders

- `onExportAction={() => {}}` — export button does nothing
- `onAddManuallyAction`, `onImportCsvAction`, `onInviteByEmailAction` — all stubs in `PeopleTopbar`
- "People Chart" tab renders nothing

#### Gaps

1. No action after bulk selection — selection has no attached operations
2. No user detail page or drill-down from row click
3. Import/Export entirely missing (stub buttons only)
4. Add user flows (manual, CSV, email invite) not implemented
5. People Chart tab is empty
6. Column visibility not persisted to localStorage
7. No permission-aware column visibility (e.g., hide sensitive fields based on `canField()`)

#### MVP Recommendation

The table itself is MVP-ready for viewing employees. The missing pieces for MVP are:
1. Row click → user detail/profile page (critical for usability)
2. At minimum one "add user" flow
3. Bulk role assignment if assignment MVP is delivered simultaneously

#### Suggested Next Tasks

- [ ] Implement row click → `/organization/people/[id]` route
- [ ] Create basic user detail/profile page
- [ ] Wire at least one "Add" action (invite by email is smallest scope)
- [ ] Connect selection to bulk role assignment once mutation hooks exist
- [ ] Persist column visibility to `localStorage`

---

## Cross-Cutting Frontend Gaps

### Missing Assignment Infrastructure

No reusable user picker or assignment pattern exists outside the Roles module. If departments, teams, or time-off policies need user assignment UI, it must be built from scratch each time. A shared `<UserPicker>` or `<MultiUserSelect>` component would reduce duplication.

### Broken Mutation Wiring

Several UI flows exist but are not connected to backend:
- Role assignment (`AssignRolesForm` → no mutation)
- Role permission update (`PermissionsModule` → no save button)
- User removal from role (`AssignedUsersModule.onRemoveUser` → stub)

### Missing Loading / Error States

- Departments and Teams: no loading skeleton (no async at all)
- `AssignedUsersModule`: unclear if error states handled
- `ErrorBoundary.tsx` is empty — any thrown errors are uncaught

### Missing Empty States

- No evidence of `EmptyState` usage in People table when zero results
- No empty state in departments/teams tree if API returns empty list

### Departments / Teams No API

Largest single gap. No DTOs, no API routes, no hooks, no mutations. Starting from zero on both modules.

### Unprotected Pages

`/settings/general/departments` and `/settings/general/teams` have no `PermissionGate`. Any authenticated user can access them.

### Stub Actions in Production

Multiple dropdowns and buttons in production UI have empty `onClick` handlers:
- Export in `AssignedUsersModule`
- All "Add" actions in `PeopleTopbar`
- Import in `PeopleTopbar`

### Debug Logs

`AssignedUsersTable.tsx` contains a `console.log`. Per CLAUDE.md, this is a known issue in multiple files (`PersonalInfoContainer`, `PersonalDocumentsContainer`, `DepartmentsPage`, `AssignedUsersTable`).

---

## Frontend MVP Completion Estimate

| Area | Completion % | Confidence | Notes |
|------|-------------|------------|-------|
| Assignment by User Property | 30% | Medium | UI exists, mutations missing. Core wiring needed. |
| Access by Roles / Permissions — infrastructure | 80% | High | Context, Gate, sidebar, route guard working. |
| Access by Roles / Permissions — management UI | 45% | High | Role CRUD works; permission editing and assignment save missing. |
| Departments | 15% | High | Only UI prototype with mock data. No backend at all. |
| Teams | 15% | High | Same as Departments — 100% mock. |
| People Table (core list) | 85% | High | Search/filter/sort/pagination fully working. |
| People Table (actions) | 10% | High | All action buttons are stubs. |

---

## Recommended Frontend MVP Plan

---

### Step 1 — Access Foundation

**Goal:** Complete the permission management loop so roles can be assigned to users and permissions can be saved.

**Tasks:**
- Create `useAssignUserRoles` mutation hook (wrap `hrisUserRolesService.assignRole`)
- Connect mutation to `AssignRolesModal` submit handler
- Create `useRemoveUserRole` mutation hook
- Implement `AssignedUsersModule.onRemoveUser` flow (with `ConfirmCancelModal`)
- Add "Save" button to `PermissionsModule` with `useUpdateRolePermissions` mutation
- Add `PermissionGate` to Departments and Teams settings pages

**Why needed:** Without working role assignment, the entire access control layer is decorative. Users cannot be given roles and permissions cannot be managed.

**Affected modules:** `roles/RoleDetailsContainer`, `roles/RolesPageContainer`, `roles/hooks/`, `auth/PermissionGate`

**Complexity:** M

---

### Step 2 — Departments & Teams

**Goal:** Replace 100% mock data with real backend integration and add basic CRUD.

**Tasks:**
- Define `DepartmentDTO`, `TeamDTO` in `models/`
- Create `app/api/departments/` and `app/api/teams/` Next.js routes
- Create `useDepartments`, `useTeams` query hooks (TanStack Query)
- Replace mock `initialData` in both containers with real `useQuery`
- Add skeleton loaders for tree and details panel
- Implement create/rename/delete modals (reuse patterns from `publicHolidays` module)
- Add `useCreateDepartment`, `useUpdateDepartment`, `useDeleteDepartment` mutations

**Why needed:** Departments and Teams are core organizational entities. Without real data, the module provides no value.

**Affected modules:** `departments/`, `teams/`, `app/api/departments/`, `app/api/teams/`, `models/`

**Complexity:** L

---

### Step 3 — Assignment Infrastructure

**Goal:** Enable assigning users to departments/teams and make assignment reusable.

**Tasks:**
- Create reusable `UserPicker` / `MultiUserSelect` component (based on `usePeopleSearch`)
- Build department member assignment UI (add/remove users from department)
- Build team membership UI (add/remove users from team)
- Wire bulk role assignment from People table selection

**Why needed:** Without user assignment, departments and teams are empty labels. Role assignment from People table improves admin UX.

**Affected modules:** `departments/`, `teams/`, `PeopleTableContainer`, new `components/ui/UserPicker/`

**Complexity:** L

---

### Step 4 — People Management Improvements

**Goal:** Make People table actionable, not just a view.

**Tasks:**
- Implement row click → user profile page (`/organization/people/[id]`)
- Create basic user profile/detail page
- Wire at least one "Add" flow (invite by email is smallest)
- Connect bulk selection to role assignment action
- Persist column visibility to localStorage

**Why needed:** A read-only people list is useful but the table must support basic user management actions for MVP.

**Affected modules:** `PeopleTableContainer`, `PeopleTopbar`, new `app/(app)/organization/people/[id]/`

**Complexity:** M–L (depends on profile page scope)

---

### Step 5 — MVP Polish

**Goal:** Fix gaps that affect perceived quality: error handling, empty states, permission guards.

**Tasks:**
- Implement basic `ErrorBoundary` component (currently empty)
- Add `EmptyState` to People table for zero-results
- Add empty states to Departments/Teams tree
- Remove `console.log` from `AssignedUsersTable` and other files
- Audit all stub action handlers — either implement or remove buttons

**Why needed:** Empty error boundaries and stub buttons make the app feel unfinished. These are visible quality signals.

**Affected modules:** `components/feedback/ErrorBoundary.tsx`, People table, Departments, Teams, `AssignedUsersTable`

**Complexity:** S–M

---

## Out of Scope Notes

The following modules were encountered but not analyzed in detail per audit scope:

- **Public Holidays** — full TanStack Query integration, used as reference module. New pages found: `public-holidays/new/`, `PublicHolidayCalendarDetailsComponent/`, `PublicHolidayDaysEditor/`
- **Time Off** — new `app/api/time-off/` routes and `timeOffPolicies/components/` found, appears to be in active development
- **Attendance** — settings page exists, not analyzed
- **Legal Entities** — working module, used as reference for settings page structure
- **Job Catalog** — settings page exists, not analyzed
- **Inbox / Notifications** — route exists at `/inbox`, not analyzed
- **Company Profile / Appearance** — known to have mock data per CLAUDE.md, not analyzed

---

*Report generated by frontend audit pass on 2026-06-14. All findings based on static code analysis. Confidence ratings reflect certainty of analysis, not certainty of implementation.*
