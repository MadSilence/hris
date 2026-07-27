# MVP Technical Readiness Review

> **Date:** 2026-06-14
> **Source documents:** Frontend MVP Audit Report, Backend MVP Audit Report
> **Purpose:** Technical discussion document for engineering decisions before MVP implementation

---

> ## ⚠️ Outdated for Roles & Permissions (as of 2026-07-24)
>
> This review was written against the old permissions architecture
> (`PermissionsContext`, `/me/permissions`, module-level access tables). That model is gone.
> Current state, in short:
>
> - Access is served by `GET /me/access` and consumed via `components/auth/useAccess.ts`.
> - `models/access/canAccess.ts` matches **actions literally** (`MANAGE` ≠ `VIEW`) and treats
>   **scopes hierarchically** (`COMPANY` covers `SELF`/`DIRECT_REPORTS`).
> - The role permission matrix editor exists and saves via `PUT /roles/{id}/permissions`
>   (full replace). Saving rotates `perm_hash`; the response carries a fresh `accessToken`
>   which the Next route swaps into the auth cookie.
> - Editing role permissions is gated by `ROLES.ROLE EDIT`; assigning/removing roles on a user
>   is gated by `PEOPLE.PROFILE MANAGE`.
>
> Recommendations in this document that assume the old model should be re-derived before use.
> Non-permissions sections were not re-verified.

---

## Executive Summary

**Strongest implemented areas:**

- People Table (frontend): search, filters, sort, cursor pagination, column picker, bulk selection — fully wired to real API. Production-ready for viewing.
- Org Units (backend): full CRUD, hierarchy via `parent_id`, access checks via `@PreAuthorize` — solid foundation.
- Public Holiday calendar management (backend): full lifecycle — create, rename, activate, deactivate, archive, delete; template system. Ready for use.
- RBAC infrastructure (both): permission catalog, role seeder, `PermissionsContext` with ETag caching, `PermissionGate` component — both sides structurally sound.
- Time Off core lifecycle (backend): policy CRUD, per-user assignment, manual balance, request create/approve/reject/cancel, activity logging — all working.
- Roles management UI (frontend): role list, create, delete, rename, details with tabs — fully wired.

**Biggest backend gaps:**

- Manager relation: `User` entity has no `managerId`. Blocks manager approval, pending-requests list, and subordinates queries.
- Public Holiday calendar assignment: no table, no service, no endpoint. Calendars exist but cannot be applied to anyone.
- Auto-balance creation: balance must be created manually after assignment. Employee cannot see their balance without admin action.
- Assignment by user properties: no generic engine. Only manual per-user assignment exists for Time Off. Public Holidays have zero assignment.
- Ownership guards: `GET /time-off/requests/{id}` and `GET /users/{id}/time-off-balances` are accessible to any authenticated user with READ, not just the owner.

**Biggest frontend gaps:**

- Departments and Teams: 100% mock data. No API calls, no hooks, no services, no CRUD, no user assignment.
- Mutation wiring: `AssignRolesForm` submission, `PermissionsModule` save, `AssignedUsersModule.onRemoveUser` — all stubs with no `useMutation` connected.
- User Time Off UI: no screens exist at all.
- Manager Time Off UI: no screens exist at all.
- All People Table action buttons (add, import, export, bulk) are stubs.
- No user detail/profile page.

**Biggest integration risks:**

- Frontend Departments/Teams screens exist but have no backend calls — full rebuild required when API is ready.
- Public Holiday calendar assignment contract is undefined on both sides — frontend has no UI, backend has no endpoint, and the data model is not yet decided.
- Time Off frontend flows are completely absent. Backend is partially ready but has access/ownership gaps that need hardening before frontend can safely consume them.
- Manager approval is blocked on `managerId` relation which affects multiple frontend flows that don't exist yet.
- `PermissionsModule` (role permission editing) has no save endpoint on backend and no mutation hook on frontend — two-sided gap for a critical RBAC flow.

**Most important technical decisions before MVP:**

1. OrgUnit membership model — attribute-based vs direct FK. Affects Departments/Teams, members endpoints, assignment model, people table filters.
2. Public Holiday assignment scope for MVP — company-only vs department/team/user. Affects migration design, resolution logic, and frontend assignment UI.
3. Balance creation timing — manual vs auto on assignment create. Blocks employee-facing Time Off view.
4. Balance consumption timing — on request create vs on approve. Currently uses create; marked TODO in backend code.
5. Role permission save strategy — full replacement vs patch/delta. Determines API contract before frontend mutation is built.
6. Manager relation design — single `managerId` FK vs separate relation table. Affects approval flow and future org chart.
7. MVP scope for Attendance, Calendar UI, Inbox — not covered in either audit; need explicit in/out decision before implementation starts.

---

## Global Technical Risks

- **Assignment model fragmentation.** Time Off uses per-user manual assignment. Public Holidays have no assignment. Departments/Teams use attribute-based membership. No shared assignment engine. Every domain that needs assignment will build its own model unless a decision is made now.

- **Missing manager relation.** No `managerId` on `User`. This single gap blocks: MANAGER approver type, pending requests list for manager, self-approval guard, any manager-scoped queries. It is flagged as TODO in `TimeOffRequestApprovalAccessService.java`.

- **Frontend Departments/Teams are 100% mock.** Both containers (`DepartmentsContainer.tsx`, `TeamsContainer.tsx`) have inline hardcoded data. When the backend API is available, these need full rewrites, not patches.

- **RBAC not consistently enforced on backend.** All Time Off controllers use `isAuthenticated()` instead of `hasAuthority('PERM_TIME_OFF_VIEW/EDIT')`. Service-layer checks exist but are not differentiated by role level at the controller boundary.

- **Missing ownership checks on Time Off.** `GET /time-off/requests/{id}` and `GET /users/{id}/time-off-balances` do not verify the actor owns the resource. Any authenticated user with READ access can read another user's data.

- **Frontend mutation flows not wired.** Role assignment, role permission update, user removal from role — all have UI shells but no `useMutation`. These appear interactive in the UI but do nothing.

- **No public holiday calendar resolution logic.** Even after assignment is built, there is no service that answers "which calendar applies to this user today." This is required for Time Off request calculation (weekend/holiday exclusion).

- **Balance timing inconsistency.** `usedBalance` is consumed at request creation, not at approval. Rejection/cancel triggers rollback. Marked TODO in backend. This is an architectural decision, not a bug — but it needs a conscious decision for MVP.

- **No reusable user picker component.** If departments, teams, or other modules need user assignment UI, each will build its own. `usePeopleSearch` is available as a hook but there is no shared `UserPicker` or `MultiUserSelect` component.

- **Stub actions visible in production UI.** Export, import, add user, remove user from role — all render as interactive buttons but have empty handlers. These degrade perceived quality.

---

## MVP Blocks

---

## 1. Organizational Structure

### Goal for MVP

Provide a working API-backed organizational hierarchy for departments and teams, with correct membership resolution, that other modules (Time Off assignment, Public Holiday assignment, People filtering) can build on.

### Backend Current State

- Implemented: full CRUD for departments and teams via shared `org_units` table with `type = DEPARTMENT | TEAM`. Hierarchy via `parent_id`. Access checks via `@PreAuthorize` and `StorageAuthorizationService`. Tenant isolation via Hibernate filters.
- Implemented: `DepartmentGetService` returns member count via `AttributeValueGetService.countEmployeesByOrgUnits` — but this is indirect.
- Partially implemented: membership — there is no direct FK from `User` to `org_units`. Membership is stored via `AttributeValue` with `SystemAttributeType.DEPARTMENT` or `TEAM`. This is a lookup through the attributes system, not a relation.
- Missing: `GET /departments/{id}/members` and `GET /teams/{id}/members` endpoints.
- Missing: `GET /users?departmentId=...` filter on user search.
- Missing: circular parent check on update. A cycle (A → parent B, B → parent A) can be created.
- Missing: reorder/drag-drop ordering (`sort_order` field absent).
- Known risk: attribute-based membership is an indirect model that requires attribute queries rather than simple FK joins. This will affect complexity of bulk assignment, filtering, and members count accuracy.

### Frontend Current State

- Missing: no API calls, no hooks, no services in the departments or teams modules.
- Mock: both `DepartmentsContainer.tsx` and `TeamsContainer.tsx` use large inline `initialData` constants with fictional data (e.g., `members: 42`, slug-based IDs like `"eng"`).
- Implemented (UI only): tree with expand/collapse, details panel, shared `SettingsDepartmentsAndTeamsLayout`.
- Missing: CRUD UI (create, rename, delete modals).
- Missing: member assignment UI.
- Missing: loading, error, and empty states.
- Missing: URL-based navigation to a specific department/team.
- Known risk: the frontend tree UI was built around the mock data shape, which may not match the actual API DTO shape.

### Integration Gaps

- Frontend has tree UI but no API. The entire data layer needs to be built.
- Backend has CRUD endpoints but no members endpoint — frontend cannot show real member lists.
- Backend returns member count via attribute query. Frontend currently shows inline mock counts. The count field needs to be agreed upon and included in the DTO.
- No agreement on whether the API returns a flat list (with `parentId`) or a tree structure. This affects frontend tree construction.
- No DTOs defined in frontend `models/` for departments or teams.

### Technical Decisions Needed

- Should user membership in departments/teams remain attribute-based (`AttributeValue` with `SystemAttributeType.DEPARTMENT`) or become a direct FK from `User` to `org_units`? Attribute-based is already in place but adds indirection. Direct FK would simplify membership queries but requires a migration.
- Should the `GET /departments` endpoint return a flat list (each item has `parentId`) and let the frontend build the tree, or should the backend return a nested tree structure? Nested is convenient but harder to paginate. Flat + client-side tree is more flexible.
- Should member counts be included in the list/get response, or fetched separately via a `/members` endpoint? Inline counts reduce round trips but add query cost on large orgs.
- Should `GET /departments/{id}/members` return full user objects or user stubs (id, name, avatar)? And should it support pagination?
- Is there a maximum hierarchy depth for MVP? Unlimited depth requires recursive queries or CTE. A depth limit simplifies implementation.
- Should moving a department to a different parent (reparenting) be a separate `PATCH /departments/{id}/parent` endpoint or handled via the existing PUT update?
- Should a circular parent check be enforced in the backend before MVP? If not, what happens when a cycle is created?
- Should departments and teams share the same base DTO on the frontend, or have separate types even though they share `org_units` on the backend?
- Should the frontend sort_order be purely cosmetic (client-side reorder not persisted) or should it be persisted to the backend?

### MVP Scope Recommendation

- Include in MVP: CRUD (create, rename, delete), hierarchy display, member count in list, `GET /{id}/members` endpoint.
- Include in MVP: Replace frontend mock data with real API calls.
- Postpone after MVP: reorder/drag-drop, move-to-parent endpoint, `GET /users?departmentId=...` filter on people search.
- Needs decision: membership model (attribute vs direct FK) — this decision affects downstream modules.

### Suggested Next Technical Tasks

- Backend — Add circular parent check in `DepartmentUpdateService` and `TeamUpdateService` — S
- Backend — Add `GET /departments/{id}/members` and `GET /teams/{id}/members` via `AttributeValue` query — M
- Backend — Include `memberCount` in department/team GET response — S — depends on attribute membership model
- Frontend — Define `DepartmentDTO`, `TeamDTO`, `DepartmentTreeNodeDTO` in `models/` — S — needed before any hook work
- Frontend — Create `useDepartments`, `useTeams`, `useDepartment`, `useTeam` query hooks — M
- Frontend — Replace `initialData` mock in both containers with real `useQuery` — M — depends on hooks and DTO
- Frontend — Add skeleton loaders for tree and details panel — S
- Both — Agree on flat vs nested API shape for tree — S — blocks all frontend tree work

### Readiness Status

MISSING — Confidence: High

---

## 2. Assignment by User Property + Simple Assignment

### Goal for MVP

Enable manual per-user assignment of Time Off policies (already exists) and Public Holiday calendars (missing). Establish a minimum viable assignment model that other modules can extend. Assignment by user properties (rules-based) is post-MVP.

### Backend Current State

- Implemented: per-user Time Off policy assignment via `TimeOffPolicyAssignment` with `effectiveFrom/effectiveTo`, `status (ACTIVE/ENDED)`. Create and end services exist. Unique constraint prevents duplicate active assignment per `(company_id, policy_id, user_id)`.
- Missing: `orgUnitId` in assignment — no assignment to a department/team/company.
- Missing: Public Holiday calendar assignment — no table, no service, no endpoint.
- Missing: generic assignment engine — each domain builds its own.
- Missing: bulk assignment (assign policy to all users in department X).
- Missing: assignment preview ("who would receive this policy if assigned by rule").
- Missing: assignment by user attribute rules.

### Frontend Current State

- Missing: no assignment UI for Time Off policies outside of what the admin sees when creating a policy assignment directly.
- Missing: no assignment UI for Public Holidays.
- Missing: no reusable `UserPicker` or `MultiUserSelect` component.
- Partially implemented: `AssignRolesForm` in the Roles module has a checkbox-based role picker, but submission is not wired — no `useMutation` connected.

### Integration Gaps

- Time Off assignment backend exists but there is no frontend screen for it beyond what is implied by the policy management pages.
- Public Holiday assignment: zero implementation on both sides. Both sides need to be built and the contract agreed upon.
- No shared assignment UI pattern exists. Roles module has a modal-based picker that is not reused.
- No frontend hooks for `createTimeOffPolicyAssignment` or `endTimeOffPolicyAssignment` are visible in the audit findings.

### Technical Decisions Needed

- Should a generic assignment engine be introduced for MVP, or should each domain (Time Off, Public Holidays) maintain its own assignment tables and services? A generic engine prevents duplication but adds upfront complexity.
- For Public Holiday calendar assignment, what scopes are supported at MVP: company-only, or also department, team, and user? The migration design changes significantly based on this.
- If multiple scope levels exist (company + department + user), what is the resolution priority for conflicting assignments? User > Department > Company? Should this be configurable?
- Should `TimeOffPolicyAssignment` be extended with `orgUnitId` for department/team-level assignment, or is per-user the only MVP scope?
- What happens if a user has no applicable calendar assigned and no company-level default exists? Is there a system fallback, or does the calculation proceed as if no public holidays exist?
- Should assignment effective dates (`effectiveFrom`, `effectiveTo`) be mandatory on creation or optional with a default of "immediately and forever"?
- When a policy is assigned to a user, should the backend auto-create a `EmployeeTimeOffBalance` record immediately? (Currently manual.)
- Should assignment by user attribute (e.g., "assign to all users where `country = CZ`") be scaffolded in the data model for MVP even if not functional, to avoid a breaking migration later?
- Should the frontend reuse a single `UserPicker` component for all assignment modals (roles, time off, public holidays), or build per-module pickers?
- Should the frontend assignment UI be a modal-per-entity (select a policy, then pick users) or user-centric (open a user, then add policies)?

### MVP Scope Recommendation

- Include in MVP: per-user Time Off policy assignment (UI and backend already partially exist).
- Include in MVP: company-level Public Holiday calendar assignment (requires new backend table and endpoint).
- Include in MVP: auto-create balance on Time Off assignment creation.
- Postpone after MVP: department/team-level assignments, assignment by user properties, bulk assignment, assignment preview.
- Needs decision: generic assignment engine scope for MVP.

### Suggested Next Technical Tasks

- Backend — Create migration + entity `public_holiday_calendar_assignments` (scope_type: COMPANY/DEPARTMENT/USER, scope_id nullable) — M
- Backend — Create `PublicHolidayCalendarAssignmentService` + controller with POST assign/GET list/DELETE — M — depends on migration
- Backend — Auto-create `EmployeeTimeOffBalance` in `TimeOffPolicyAssignmentCreateService` when assignment is created — M
- Backend — Create `resolveCalendarForUser(companyId, userId)` service — S — depends on assignment table
- Frontend — Build `useAssignUserToTimeOffPolicy` and `useEndTimeOffPolicyAssignment` mutation hooks — M
- Frontend — Build Public Holiday calendar assignment modal — M — depends on backend endpoint
- Both — Define Public Holiday assignment DTO and endpoint contract — S — blocks both sides

### Readiness Status

PARTIAL (Time Off per-user exists) / MISSING (Public Holidays, generic engine) — Confidence: High

---

## 3. Access by Roles

### Goal for MVP

Administrators can assign roles to users and update role permissions. The permission system gates UI and backend endpoints consistently. At minimum: role assignment, role permission save, and permission checks on all sensitive endpoints.

### Backend Current State

- Implemented: permission catalog, role seeder with three default roles (System Owner, HR Admin, Manager), `@PreAuthorize` on Org Structure and Public Holiday controllers, `StorageAuthorizationService` for field-level checks, ETag-based permission caching.
- Implemented: `DELETE /roles/{id}`, `PATCH /roles/{id}` (rename), `GET /roles`, `GET /roles/{id}/permissions` (assumed via `useRoleModulePermissions`).
- Implemented: `POST /roles/{userId}/assign`, `DELETE /roles/{userId}/remove` exist in `hrisUserRolesService` — but they are not exposed as React Query mutations.
- Missing: `PUT /roles/{id}/permissions` — no frontend mutation found, unclear if backend endpoint exists for full permission update.
- Weak: all Time Off controllers use `isAuthenticated()` instead of `hasAuthority('PERM_TIME_OFF_VIEW/EDIT')`. RBAC not enforced at controller level for Time Off.
- Missing: ownership guard on Time Off requests and balances.
- Missing: self-approval guard.

### Frontend Current State

- Implemented: `PermissionsContext` with `can()`, `canModule()`, `canField()`, ETag caching in localStorage. `PermissionGate` with `anyOf/allOf`. `AccessDenied` component. Sidebar filtered by `canModule()`. People route protected.
- Implemented: Role list (CRUD: create, delete, rename), `RoleDetailsContainer` with "Assigned Users" and "Permissions" tabs.
- Not wired: `AssignRolesForm` has checkbox UI but `onSubmitAction` is not connected to a `useMutation`.
- Not wired: `PermissionsModule` renders permission tables read-only — no save button, no mutation.
- Stub: `AssignedUsersModule.onRemoveUser` is an empty arrow function.
- Missing: `useAssignUserRoles` and `useRemoveUserRole` mutation hooks.
- Missing: Settings sidebar items have no `PermissionGate` — settings section always visible regardless of permissions.
- Missing: Departments and Teams settings pages not wrapped in `PermissionGate`.

### Integration Gaps

- Backend role assignment endpoints exist (`/roles/{userId}/assign`, `/roles/{userId}/remove`) but frontend has no mutation hooks for them. The UI appears functional but does nothing on submit.
- Backend likely has a `PUT /roles/{id}/permissions` endpoint (or needs one) but frontend `PermissionsModule` has no save mutation. Both sides are incomplete.
- `useRoleModulePermissions` hook exists in frontend but it is not confirmed whether it fetches from real backend or uses mock data — this needs verification.
- `PermissionsModule` shows read-only tables. The backend permission update contract (full replacement vs patch) is not defined and the endpoint may not exist.
- Backend enforces permissions via `@PreAuthorize` on Org/Public Holiday controllers, but Time Off endpoints use only `isAuthenticated()`. Frontend uses `PermissionGate` in some places, creating an asymmetry.

### Technical Decisions Needed

- Should role permission updates be sent as full replacement (the frontend sends the complete permission matrix) or as a delta/patch (only changed entries)? Full replacement is simpler but expensive for large permission sets.
- Should the `PUT /roles/{id}/permissions` endpoint accept the same shape as `GET /roles/{id}/permissions` returns, or a different DTO? The API contract must be defined before the frontend mutation is built.
- Should `PermissionsModule` have an explicit "Save" button per tab, or a single save for all permissions at once? This determines whether the user can partially save module vs attribute vs personal data permissions.
- Should removing a user from a role require a confirmation modal? What confirmation copy/state change should be shown?
- What does assigning a role to a user do if the user already has that role? Backend should idempotent-create or return a conflict error.
- Should role assignment support multiple roles per user in the UI (checkbox multi-select) or only one role at a time?
- Should the Settings section in the sidebar be hidden for users without any settings permissions? Which permission gates which settings sub-section?
- Should `PermissionGate` use `anyOf` or `allOf` semantics for the Departments/Teams pages? What specific permission code is required (`PERM_ORG_STRUCTURE_VIEW`)?
- Should field-level visibility in People Table (`canField()`) be enforced at the column level on the frontend, hiding columns the user cannot see? What is the expected behavior for a user with no PEOPLE field access?
- Should the frontend hide role assignment actions based on `PermissionGate`, or should it attempt the call and show an error if the backend rejects? The better UX is to hide, but the backend must enforce independently.
- Does `useRoleModulePermissions` actually call a real backend endpoint? If not, what is the correct endpoint URL and does it need to be created?
- Should the frontend re-fetch permissions from `GET /me/permissions` after a role is assigned to the current user, or wait for ETag cache expiry?

### MVP Scope Recommendation

- Include in MVP: wire role assignment mutation, wire role permission save mutation, implement user removal from role with confirmation, add `PermissionGate` to Departments/Teams and Settings pages.
- Include in MVP: add `hasAuthority('PERM_TIME_OFF_VIEW/EDIT')` to Time Off controllers on backend.
- Include in MVP: ownership guard on Time Off requests and balances.
- Postpone after MVP: field-level permission enforcement in People Table columns, audit log for permission changes, multi-step role assignment.
- Needs decision: full replacement vs patch for permission save, sidebar settings permission gating.

### Suggested Next Technical Tasks

- Backend — Verify and expose `PUT /roles/{id}/permissions` endpoint with full-replacement DTO — S/M — blocks frontend save
- Backend — Replace `isAuthenticated()` with `hasAuthority('PERM_TIME_OFF_VIEW')` on all Time Off GET endpoints — S
- Backend — Add ownership check in `TimeOffRequestGetService` and `EmployeeTimeOffBalanceListByUserService` — S
- Backend — Add self-approval guard in `TimeOffRequestApproveService` — S
- Frontend — Create `useAssignUserRoles` mutation hook wrapping `hrisUserRolesService.assignRole` — S
- Frontend — Create `useRemoveUserRole` mutation hook with cache invalidation — S
- Frontend — Connect `AssignRolesForm` to `useAssignUserRoles` on submit — S — depends on hook
- Frontend — Implement `AssignedUsersModule.onRemoveUser` with `ConfirmCancelModal` and `useRemoveUserRole` — S
- Frontend — Add "Save" button to `PermissionsModule` connected to permission save mutation — M — depends on backend endpoint and DTO
- Frontend — Add `PermissionGate` (PERM_ORG_STRUCTURE_VIEW) to Departments and Teams settings pages — S
- Frontend — Verify `useRoleModulePermissions` calls real backend; fix or create if needed — S

### Readiness Status

PARTIAL — Confidence: High

---

## 4. Departments and Teams

### Goal for MVP

Replace mock data with real API integration. Provide CRUD for both departments and teams. Display real member counts. This is the largest single frontend gap.

### Backend Current State

- Implemented: full CRUD via `DepartmentController` and `TeamController`. Hierarchy via `parent_id`. Access checks in place.
- Partially implemented: member count returned from `DepartmentGetService` via attribute query — works but indirect.
- Missing: `GET /departments/{id}/members` and `GET /teams/{id}/members` dedicated endpoints.
- Missing: circular parent check.
- Known risk: membership via `AttributeValue` requires joining through the attributes system — not a direct FK.

### Frontend Current State

- Missing: every part of data fetching. No hooks, no services, no API client usage.
- Mock: `DepartmentsContainer.tsx` has ~174 lines of inline `initialData`. `TeamsContainer.tsx` has ~148 lines of the same.
- Implemented (UI shell only): tree with expand/collapse, details panel, shared layout.
- Missing: CRUD modals (create, rename, delete).
- Missing: loading, error, empty states.
- Missing: URL parameter routing to selected node.
- Missing: `PermissionGate` wrapper on both pages.

### Integration Gaps

- No DTOs defined in frontend `models/`. The mock data shape may not match the backend response shape.
- Backend returns a flat list per API design — frontend will need to build the tree client-side unless a tree endpoint is added.
- Backend does not have a members endpoint — frontend cannot show a real member list panel.
- The mock data has string slug IDs (`"eng"`, `"product"`). The backend uses UUID IDs. The frontend tree selection and URL routing logic depends on ID format.

### Technical Decisions Needed

- Should the `/departments` endpoint return a flat list with `parentId` or a pre-built nested tree? The tree approach requires recursive construction on backend; flat requires it on frontend.
- Should member count be embedded in the list/get response or fetched lazily when a node is selected?
- Should the details panel show a paginated list of members or a count-only summary for MVP?
- Should URL routing use the department/team UUID as the path parameter (e.g., `/settings/general/departments/[id]`) or keep state in-memory only?
- Should "create department" support setting a parent on creation, or only allow top-level creation with reparenting as a separate step?
- What should "delete" do when a department has children? Refuse deletion, or cascade to set children's parent to null (already handled by `ON DELETE SET NULL` in migration)?
- Should the tree expand state be in local component state or persisted (URL params / localStorage)?
- Should the Departments and Teams pages share the same container logic or remain separate containers with a shared layout component?

### MVP Scope Recommendation

- Include in MVP: wire real API, CRUD modals (create, rename, delete), loading/error/empty states, member count in details.
- Include in MVP: `PermissionGate` on both pages.
- Postpone after MVP: drag-drop reorder, inline member assignment, member paginated list.
- Needs decision: tree vs flat API, URL routing for selected node.

### Suggested Next Technical Tasks

- Frontend — Define `DepartmentDTO`, `TeamDTO` in `models/` — S — prerequisite for all other tasks
- Frontend — Create `useDepartments`, `useTeams`, `useDepartment`, `useTeam` hooks — M
- Frontend — Create `useCreateDepartment`, `useUpdateDepartment`, `useDeleteDepartment` mutations — M
- Frontend — Replace `initialData` mock in `DepartmentsContainer` with `useQuery` — M — depends on hooks
- Frontend — Replace `initialData` mock in `TeamsContainer` with `useQuery` — M — depends on hooks
- Frontend — Add skeleton loaders for tree and details panel — S
- Frontend — Implement create/rename/delete modals following `publicHolidays` pattern — M
- Backend — Add `GET /departments/{id}/members` endpoint — M
- Backend — Add circular parent check — S

### Readiness Status

MISSING (frontend) / PARTIAL (backend) — Confidence: High

---

## 5. Org Structures UI Simple for MVP

### Goal for MVP

A minimal but functional org structure UI that shows departments and teams in a tree, with a details panel, and basic CRUD. Not an org chart. Not a drag-drop editor.

### Backend Current State

- Same as Block 1 and Block 4 — CRUD is ready. Members endpoint is missing.

### Frontend Current State

- UI shell exists (tree + details panel + layout) but all data is mocked. The shell is the right starting point.
- No state management for URL routing.
- No skeleton or empty states.

### Integration Gaps

- The existing tree UI was designed around the mock data shape. Specific gaps: mock uses `members: number` (inline count), real API may return it in a different field. Mock uses short string IDs, API uses UUIDs. Tree node shape needs to be reconciled.

### Technical Decisions Needed

- Should the MVP org structure UI support navigation via URL (e.g., `/settings/general/departments/[id]`) so that the selected department can be linked or bookmarked?
- Should searching/filtering within the tree be required for MVP or deferred?
- Should the details panel support inline editing, or only via a separate modal?
- Should the "Responsibilities" and "About" fields from the mock data model map to real backend fields in `OrgUnit`, or are they removed for MVP?
- What is the minimum set of fields shown in the details panel for MVP: name, member count, parent, code/about?

### MVP Scope Recommendation

- Include in MVP: tree display with real data, details panel with name and member count, basic CRUD modals.
- Postpone after MVP: inline editing, org chart visualization, drag-drop, search within tree.

### Suggested Next Technical Tasks

- All tasks from Block 4 apply here.
- Frontend — Reconcile mock data shape with real DTO, update tree rendering logic — S — after DTO is defined.

### Readiness Status

MISSING — Confidence: High

---

## 6. People Table UI + Improvement with Updated Access and Controls

### Goal for MVP

People table is production-ready for viewing. For MVP: at minimum one add flow, row click to user profile, and bulk role assignment once mutations are wired.

### Backend Current State

- Implemented: `POST /users/search` with pagination, sort, filters — fully functional.
- Implemented: `GET /users/fields` — field metadata.
- Missing: frontend-facing import/export endpoints (stubs in UI).
- Missing: add user / invite by email endpoint (stubs in UI).
- Partially implemented: role assignment endpoints exist in `hrisUserRolesService` but are not wired to React Query mutations.

### Frontend Current State

- Implemented: search (debounced), filters (multi-operator), sorting, cursor pagination, column picker, bulk row selection — all wired to `POST /users/search`.
- Implemented: `roles[]` included in `UsersSearchItemDTO`.
- Stub: export button (`onExportAction: () => {}`).
- Stub: all add actions — add manually, import CSV, invite by email.
- Stub: no click handler on row — no navigation to user detail.
- Missing: bulk action triggered by bulk selection (selection is implemented, action is not).
- Missing: user detail/profile page (`/organization/people/[id]`).
- Missing: column visibility not persisted to localStorage.
- Missing: People Chart tab (tab renders but component is absent).
- Missing: `EmptyState` for zero-results case.
- Missing: permission-aware column visibility (`canField()`).

### Integration Gaps

- Role assignment mutations do not exist as hooks — bulk role assignment from People Table selection has no backend path even though the UI selection works.
- No user detail page exists, so row click has no destination.
- Import/export: stub in frontend, no backend endpoint integrated.
- Add user flow: stub in frontend, backend endpoint unknown/unverified.

### Technical Decisions Needed

- Should row click navigate to `/organization/people/[id]` immediately, or open a side panel/drawer for MVP?
- What is the minimum content of a user detail/profile page for MVP: basic info only, or also roles, time off, department?
- Should bulk role assignment be triggered via the People Table selection, or is it only available from the Roles module?
- Should the "invite by email" action call an existing backend endpoint or require a new one?
- Should export be a synchronous download or an async job (for large orgs)? This affects the endpoint design.
- Should column visibility be persisted per-user in backend user settings, or client-only in localStorage?
- Should permission-aware column hiding (via `canField()`) be implemented before MVP, or is it acceptable to show all columns to all users initially?
- Should the People Chart tab be hidden (removed from tab list) for MVP if it has no content, or left visible with an empty state?
- Should empty state in the people table show different messaging depending on whether the empty result is due to filters or an actually empty org?

### MVP Scope Recommendation

- Include in MVP: row click to user profile page (even minimal profile).
- Include in MVP: at least one add flow (invite by email is lowest scope).
- Include in MVP: `EmptyState` for zero-results.
- Include in MVP: connect bulk selection to role assignment once role mutation hooks are built.
- Postpone after MVP: export, import CSV, People Chart, column persistence, permission-aware column hiding.

### Suggested Next Technical Tasks

- Frontend — Implement row click navigation to `/organization/people/[id]` — S
- Frontend — Create minimal user profile page at `/organization/people/[id]` — M
- Frontend — Wire bulk selection to role assignment action using `useAssignUserRoles` — S — depends on mutation hooks
- Frontend — Add `EmptyState` component to People Table for zero-results — S
- Frontend — Remove or hide People Chart tab for MVP — S
- Backend — Verify invite-by-email endpoint exists and document the contract — S

### Readiness Status

PARTIAL — Confidence: High

---

## 7. Public Holidays Assignment and Edge Cases

### Goal for MVP

Allow an administrator to assign a public holiday calendar to the entire company (minimum scope). The calendar should be resolvable per user so it can be used in Time Off request calculations.

### Backend Current State

- Implemented: full calendar and holiday management (create, rename, activate, deactivate, archive, delete, template import).
- Missing: `public_holiday_calendar_assignments` table — no migration, no entity.
- Missing: assignment service and controller.
- Missing: `resolveCalendarForUser(companyId, userId)` service — needed for Time Off integration.
- Missing: behavior when a calendar is archived while active assignments exist — no guard.
- Missing: timezone handling — `holiday_date` is stored as `DATE` (correct), but no timezone field on user or office level.
- Missing: integration with Time Off request amount calculation.

### Frontend Current State

- Missing: no assignment UI anywhere for public holiday calendars.
- Missing: no API hooks for calendar assignment.
- Implemented: calendar management UI (list, create, edit, template modal) — appears fully wired per audit.
- Unknown: whether the calendar details page shows current assignment status.

### Integration Gaps

- Backend can manage calendars but cannot assign them. Frontend has no assignment UI.
- No API endpoint exists for `POST /public-holiday-calendars/{id}/assign`.
- No endpoint exists for `GET /users/{userId}/public-holiday-calendar` (resolved calendar).
- Time Off request creation on the backend does not call any calendar resolution — weekends and public holidays are not excluded from `requestedAmount`.

### Technical Decisions Needed

- Should public holiday calendar assignment for MVP support only company-level scope, or also department, team, and individual user scopes?
- What is the resolution priority when multiple assignments exist? Proposed: user > department > company. Is this configurable per company?
- What should happen when a user has no applicable calendar? Should there be a required company-level default, or should the system allow "no calendar" (treating all days as working)?
- Should archiving a calendar check for active assignments and block archival, or proceed and leave assignments pointing to an archived calendar?
- Should a calendar be deactivatable if it has active assignments?
- Should the frontend assignment UI be embedded in the calendar details page ("Assign this calendar") or be a separate management page?
- Should the assignment support `effectiveFrom` / `effectiveTo` dates (matching Time Off assignment pattern), or be permanent until explicitly changed?
- Should the `resolveCalendarForUser` service be called during Time Off request creation for the initial MVP, or is weekend/holiday exclusion post-MVP?
- Should public holidays be visible to employees (e.g., on a calendar view), or is the calendar only used internally for calculations?
- What happens if a holiday falls on a weekend? Is it counted as a holiday, moved to the next working day, or ignored?

### MVP Scope Recommendation

- Include in MVP: company-level calendar assignment (migration, entity, service, endpoint).
- Include in MVP: `resolveCalendarForUser` service (required for future Time Off integration).
- Include in MVP: frontend assignment UI in calendar details page.
- Postpone after MVP: department/team/user-level assignment, timezone per user/office, holiday on weekend handling, Time Off integration with calendar resolution.
- Needs decision: archive behavior with active assignments.

### Suggested Next Technical Tasks

- Backend — Create migration `V18__public_holiday_calendar_assignments.sql` — M
- Backend — Create entity `PublicHolidayCalendarAssignment` with `calendarId, scopeType (COMPANY|DEPARTMENT|USER), scopeId` — S
- Backend — Create `PublicHolidayCalendarAssignmentService` with assign/get/delete — M
- Backend — Create `POST /public-holiday-calendars/{id}/assign` endpoint — S — depends on service
- Backend — Create `resolveCalendarForUser(companyId, userId)` service — S
- Frontend — Create `useAssignPublicHolidayCalendar` mutation hook — S
- Frontend — Add assignment UI to calendar details page — M — depends on backend endpoint
- Both — Define assignment DTO contract (what scopes supported at MVP) — S — decision required first

### Readiness Status

MISSING (assignment) / PARTIAL (calendar management) — Confidence: High

---

## 8. Time Off Enhancement with Assignments and Management

### Goal for MVP

Administrators can create and manage Time Off policies, assign them to individual users, and manage balances. The full request lifecycle (create, approve, reject, cancel) is functional with SPECIFIC_USER approver.

### Backend Current State

- Implemented: policy CRUD, policy lifecycle (DRAFT/ACTIVE/ARCHIVED), carryover/renewal field validation, per-user assignment (create/end), manual balance creation with all balance fields, balance adjustment and history, request create with overlap and balance check, approve/reject/cancel, SPECIFIC_USER approver, activity logging.
- Partially implemented: `hiddenFromEmployees` stored but not applied in list queries. `unit (DAYS/HOURS)` stored but `requestedAmount` always calculated as calendar days. Carryover and renewal validated on create but no processing jobs exist.
- Missing: auto-balance creation when assignment is created.
- Missing: yearly renewal job (Spring Scheduler).
- Missing: carryover processing.
- Missing: bulk assignment to department/team.
- Missing: weekends/public holidays exclusion in `requestedAmount`.
- Missing: `GET /api/users/me/time-off-assignments` — employee cannot see their own assignments.
- Known risk: `usedBalance` consumed at request creation, not at approval. Marked TODO. This means a rejected request temporarily reduces available balance.
- Known risk: `TimeOffPolicyController` uses `isAuthenticated()` — no RBAC enforcement at controller level.

### Frontend Current State

- Missing: no Time Off policy management UI found in audit scope beyond what is implied by the active development in `timeOffPolicies/components/`.
- New (unaudited): `app/api/time-off/` routes and `timeOffPolicies/components/` found in git status — these are in active development but not yet audited.
- Known: `app/(app)/settings/time/time-off/page.tsx` exists (modified in current branch).

### Integration Gaps

- Frontend Time Off management is in active development but unaudited — integration gaps cannot be fully assessed without reading those files.
- Backend balance is not auto-created on assignment — any frontend that shows the employee their balance will show nothing until an admin manually creates it.
- Backend `GET /api/users/me/time-off-assignments` does not exist — an employee-facing assignment list has no endpoint.
- RBAC not enforced at controller level for any Time Off endpoint.

### Technical Decisions Needed

- Should balance be auto-created when a policy is assigned to a user? If yes, with what initial values — zero opening balance, or a configured default?
- Should `usedBalance` be consumed at request creation (current behavior) or at approval (more correct)? This is an architectural decision that affects the balance display and what users see while requests are pending.
- Should the Time Off policy admin UI allow bulk assignment (select multiple users from a picker), or only single-user assignment for MVP?
- What should happen to existing balance when a policy assignment is ended (`effectiveTo` is set)? Should unused balance be zeroed, frozen, or retained?
- Should `hiddenFromEmployees` suppress the policy from the employee's available policy list, or also hide existing requests under that policy?
- Should `unit (DAYS/HOURS)` affect the `requestedAmount` calculation for MVP, or is it stored and deferred to a future calculation engine?
- What is the correct RBAC permission level for an employee to view their own balance vs an admin viewing any balance? Should this be separated into distinct permission codes or handled via ownership checks?
- Should carryover balance be manually adjustable by the admin, or should it only be set by the (future) renewal job?
- Should the approval settings UI (SPECIFIC_USER vs MANAGER approver) be fully editable in the MVP policy form, or should MANAGER be shown as disabled/future?

### MVP Scope Recommendation

- Include in MVP: auto-balance creation on assignment, ownership guards, RBAC at controller level, `GET /me/time-off-assignments`.
- Include in MVP: policy and assignment management UI (in active development — audit needed).
- Postpone after MVP: renewal job, carryover processing, bulk assignment, weekends/holiday exclusion, HOURS unit calculation.
- Needs decision: `usedBalance` timing (create vs approve).

### Suggested Next Technical Tasks

- Backend — Auto-create `EmployeeTimeOffBalance` in `TimeOffPolicyAssignmentCreateService` — M
- Backend — Add `GET /api/users/me/time-off-assignments` endpoint — S
- Backend — Add `hasAuthority('PERM_TIME_OFF_VIEW')` to all Time Off GET endpoints — S
- Backend — Apply `hiddenFromEmployees` filter in `TimeOffPolicyGetService` for non-admin actors — S
- Frontend — Audit `timeOffPolicies/components/` to assess current state — S — prerequisite for further planning
- Both — Decide `usedBalance` timing before MVP launch — S — architectural decision

### Readiness Status

PARTIAL — Confidence: Medium (frontend in active development, state unknown)

---

## 9. Attendance

### Goal for MVP

Not defined in either audit. No backend or frontend implementation found.

### Backend Current State

- Not analyzed in backend audit. No attendance-related entities or endpoints referenced.

### Frontend Current State

- A settings page for attendance exists per audit ("Attendance — settings page exists, not analyzed"). No further detail.

### Integration Gaps

- Entirely unknown — no data from either audit.

### Technical Decisions Needed

- Is Attendance in or out of MVP scope? This needs an explicit decision.
- If in MVP: what is the minimum feature set — clock-in/clock-out only, or also schedule, overtime, absences?
- If out of MVP: should the settings page route be hidden or show a "coming soon" placeholder?
- Does Attendance depend on the Time Off module (e.g., approved leave reduces attendance requirement)?
- Does Attendance depend on the org structure module (team-level scheduling)?

### MVP Scope Recommendation

- Needs decision: whether Attendance is in MVP scope at all.
- If deferred: hide or stub the settings page to prevent confusion.

### Suggested Next Technical Tasks

- Both — Decide if Attendance is in MVP scope — S — decision required
- Frontend — If deferred: hide attendance route or show placeholder — S

### Readiness Status

NEEDS DECISION — Confidence: Low

---

## 10. User Time Off

### Goal for MVP

An employee can view their assigned Time Off policies, see their balance per policy, submit a request, and view the status of their requests.

### Backend Current State

- Implemented: `POST /time-off/requests` with overlap check, balance check.
- Implemented: `GET /users/{userId}/time-off-requests` (list by user).
- Implemented: `POST /time-off/requests/{id}/cancel`.
- Implemented: `GET /users/{userId}/time-off-balances` (list balances).
- Missing: `GET /api/users/me/time-off-assignments` — employee cannot discover their available policies.
- Missing: `GET /api/users/me/time-off-policies` — derived policy list for employee.
- Missing: ownership guard on `GET /time-off/requests/{id}` — any user with READ can see any request.
- Missing: ownership guard on `GET /users/{userId}/time-off-balances` — any user with READ can see any balance.
- Missing: auto-balance creation — employee sees no balance without admin action.
- Missing: filter by year/status in request list.
- Missing: weekends/holidays exclusion in `requestedAmount` calculation.
- Known risk: `TimeOffRequestListByUserService` does not verify `actorUserId == userId` — any user with READ sees others' requests.

### Frontend Current State

- Missing: no user-facing Time Off UI found in audit scope. No screens for submitting a request, viewing balance, or viewing request history.
- Active development: `app/api/time-off/` and `timeOffPolicies/components/` are present in git status as new files — state unknown.

### Integration Gaps

- No user-facing frontend screens to assess. Backend endpoints exist for request create/cancel/list, but without frontend to wire them, integration cannot be evaluated.
- Critical user flow gap: employee cannot see what policies they are assigned to (no endpoint), cannot see their balance until admin creates it manually, and cannot filter their request history.

### Technical Decisions Needed

- Should the user Time Off flow have a dedicated section in the app sidebar (e.g., "My Time Off"), or be embedded in the user profile page?
- Should the balance display show `openingBalance + accruedBalance - usedBalance + adjustedBalance + carriedOverBalance` computed on the frontend, or should the backend compute and return a single `availableBalance` field?
- Should the employee see all assigned policies or only those with `hiddenFromEmployees = false`?
- Should the request form validate against the balance client-side before submission, or rely solely on backend rejection?
- Should a user be able to request time off for a period beyond the policy's `effectiveTo` date on their assignment?
- Should request history be filtered by default (current year only), or show all-time?
- What should the employee see when they have zero balance: "0 days remaining" or a message explaining the policy is not yet configured?
- Should the employee be able to see the approval settings for a policy (who their approver is) before submitting a request?
- Should a calendar-style view of the employee's approved time off be required for MVP, or is a list sufficient?

### MVP Scope Recommendation

- Include in MVP: view assigned policies, view balance, submit request, view request list, cancel pending request.
- Include in MVP: `GET /me/time-off-assignments`, ownership guards, auto-balance creation (from Block 8).
- Postpone after MVP: calendar view, filter by year, weekends/holiday exclusion.
- Needs decision: balance calculation field (computed vs derived).

### Suggested Next Technical Tasks

- Backend — Add `GET /api/users/me/time-off-assignments` and `GET /api/users/me/time-off-policies` endpoints — S each
- Backend — Add ownership check in `TimeOffRequestGetService` — S
- Backend — Add `actorUserId == userId` check in `TimeOffRequestListByUserService` — S
- Backend — Add year/status filters to request list — S
- Frontend — Build user Time Off dashboard (depends on API audit of active files) — L
- Frontend — Build request submission form with policy/date picker — M

### Readiness Status

MISSING (frontend) / PARTIAL (backend) — Confidence: Medium

---

## 11. Manager Time Off

### Goal for MVP

A manager can see pending Time Off requests from their direct reports and approve or reject them.

### Backend Current State

- Implemented: approve/reject endpoints with activity log, rejection reason validation, SPECIFIC_USER approver, status machine (only PENDING can be approved/rejected).
- Missing: `managerId` on `User` entity — no way to determine manager-subordinate relationships.
- Missing: MANAGER approver resolution in `TimeOffRequestApprovalAccessService` — explicitly marked `// TODO`.
- Missing: `GET /api/time-off/requests/pending-for-approval` — no endpoint for manager to list their queue.
- Missing: self-approval guard — a manager can approve their own request.
- Missing: multi-step approval (scaffolded in entity, not implemented in logic).
- Missing: notification/email hooks when a request is submitted or decided.

### Frontend Current State

- Missing: no manager-facing Time Off screens found in audit scope.

### Integration Gaps

- MANAGER approver type is defined in the enum and in the approval settings DTO, but cannot be resolved at runtime. Any approval policy using MANAGER approver will silently fail or fall through.
- No frontend exists to surface the manager approval queue.
- No backend endpoint exists to power a manager approval queue.

### Technical Decisions Needed

- Should `managerId` be a simple nullable FK on `User` (single manager per user) or a many-to-many relation (multiple managers, primary/secondary)? The single FK is simpler and unblocks most MVP use cases.
- Should the manager relation be set via the user profile edit (admin sets manager), via org structure (department head = manager), or separately?
- Should the MANAGER approver be blocked in the approval settings UI for MVP, or shown as configurable with a backend TODO warning?
- Should the `GET /api/time-off/requests/pending-for-approval` endpoint filter by `actorUserId == request.approverId` (SPECIFIC_USER), by manager relation (MANAGER), or both?
- Should self-approval be blocked with an error at the backend, or prevented by the frontend not showing the approve button on the user's own requests?
- Should multi-step approval (multiple approvers, ordered or all-required) be required for MVP, or is single-approver sufficient?
- Should the manager approval UI show additional context (remaining balance, prior requests this year) alongside the request, or just the request details?
- Should rejected requests notify the employee? Is an email notification required for MVP or is in-app state sufficient?
- Should the manager see requests from all subordinates, or only direct reports (one level down)?

### MVP Scope Recommendation

- Include in MVP: `managerId` FK on User, MANAGER approver resolution, self-approval guard, `GET /pending-for-approval` endpoint.
- Include in MVP: frontend manager approval queue screen.
- Postpone after MVP: multi-step approval, notification emails, multi-level subordinate queries.
- Needs decision: managerId model (single FK vs relation table), approval UI context scope.

### Suggested Next Technical Tasks

- Backend — Add `managerId` (nullable FK to `users`) to `User` entity and migration — M — prerequisite for all manager flows
- Backend — Expose `managerId` in user DTOs — S
- Backend — Implement MANAGER approver resolution in `TimeOffRequestApprovalAccessService` — M — depends on managerId
- Backend — Add self-approval guard in approve/reject services — S
- Backend — Create `GET /api/time-off/requests/pending-for-approval` endpoint — M
- Frontend — Build manager approval queue screen — M — depends on pending-for-approval endpoint
- Frontend — Add approve/reject actions to request detail view with confirmation — S

### Readiness Status

MISSING — Confidence: High

---

## 12. Calendar Public Holidays + Simple Time Off

### Goal for MVP

A calendar view showing public holidays and the current user's approved time off. This is primarily a frontend visualization block.

### Backend Current State

- Implemented: public holiday data exists per calendar. Endpoint to fetch holidays by calendar is available.
- Missing: endpoint to fetch the calendar resolved for the current user (`resolveCalendarForUser` — not yet built).
- Missing: endpoint to fetch approved time off requests in a date range for the current user.
- Partially implemented: `GET /users/{userId}/time-off-requests` can list requests, but filtering by status and date range is missing.

### Frontend Current State

- Not found in audit scope. No calendar view component or route found.
- "People Chart" tab in People Table exists but component is missing — unclear if this refers to the same calendar view.

### Integration Gaps

- No frontend calendar component and no resolved-calendar API endpoint. Both need to be built.
- Time Off request list does not support date-range filtering — a calendar view would need to query a month/week range.

### Technical Decisions Needed

- Should the calendar view be a standalone page/route or a component embedded in the user's Time Off dashboard?
- Should the calendar show only the current user's data, or also team members' time off (for manager view)?
- Should weekends be automatically marked as non-working days regardless of calendar, or only if the user has a calendar that excludes them?
- Should the calendar show pending requests differently from approved requests?
- Does the calendar need to support month navigation, or is a 2-week or 4-week fixed window sufficient for MVP?
- Should public holiday names be shown as tooltips/labels on the calendar, or just as highlighted days?
- Is this block required for MVP at all, or deferred?

### MVP Scope Recommendation

- Needs decision: whether this block is in MVP scope.
- If included: depends on Block 7 (calendar assignment and resolution) and Block 10 (user Time Off request list with date filters).
- Postpone after MVP: team member visibility on calendar.

### Suggested Next Technical Tasks

- Backend — Add status and date-range filters to `GET /users/{id}/time-off-requests` — S — required for calendar
- Backend — Add `GET /users/me/calendar?month=&year=` endpoint aggregating holidays and approved requests — M
- Frontend — Build calendar view component — M — depends on resolved calendar endpoint

### Readiness Status

NEEDS DECISION — Confidence: Low

---

## 13. Time Off Advanced Settings

### Goal for MVP

Clarify which advanced policy settings are active vs passive for MVP. Prevent user confusion from settings that appear configurable but have no runtime effect.

### Backend Current State

Active settings (enforce runtime behavior):
- `yearlyQuota` — checked on balance creation.
- `unlimitedQuota` — validated.
- `allowNegativeBalance` — used in request creation.
- `renewalType/renewalFixedDay/Month` — validated on policy create/update.
- `carryoverType/carryoverLimit/carryoverExpiryType/Value/Unit` — validated on policy create/update.
- SPECIFIC_USER approver — working.

Passive settings (stored but not used):
- `isPaid` — stored only.
- `hiddenFromEmployees` — stored but not filtered.
- `unit (DAYS/HOURS)` — stored but `requestedAmount` always in calendar days.
- `renewalType` — validated but renewal processing job does not exist.
- `carryoverType` — validated but carryover processing does not exist.
- MANAGER approver — TODO.

Not in schema (not implementable for MVP):
- `min/max duration`, `min request unit`, `accrual`, `notice period`, `attachment requirement`, `weekend/holiday exclusion` (as a policy field).

### Frontend Current State

- Policy form UI in active development (not yet audited).
- Unknown which settings fields are rendered in the create/edit form.
- Risk: if the frontend renders all settings fields including passive ones, users may configure them expecting behavior that does not occur.

### Integration Gaps

- The frontend policy form must distinguish between active settings (enforced on MVP) and passive/future settings (stored but not enforced). If the UI shows carryover configuration as functional, users will expect it to work.
- No API contract exists for the full policy create/update DTO — the frontend form shape may not match backend validation.

### Technical Decisions Needed

- Should passive settings (carryover, renewal, unit) be shown in the policy form for MVP? If shown, should they be disabled with a "coming soon" label, or hidden entirely?
- Should `hiddenFromEmployees` be enforced before MVP launch? It is a one-line addition to the list query filter.
- Should `unit (DAYS/HOURS)` affect the request form for MVP — e.g., should an hours-based policy show a time picker instead of a date picker?
- Should `allowNegativeBalance` be exposed in the UI with an explanation of what it does, or be an advanced/hidden setting for MVP?
- Should the policy form allow saving a policy in DRAFT status with incomplete advanced settings, or require all active settings to be valid before saving?
- Should the carryover and renewal fields in the form be grouped as "future configuration" with a visual indicator that they are not yet active?

### MVP Scope Recommendation

- Include in MVP: apply `hiddenFromEmployees` filter (simple backend change). Enforce active settings in UI.
- Include in MVP: clearly mark passive settings (carryover, renewal, unit) as inactive in the policy form.
- Postpone after MVP: renewal job, carryover processing, HOURS-based request calculation, min/max duration.
- Needs decision: how to present passive settings in the frontend form.

### Suggested Next Technical Tasks

- Backend — Apply `hiddenFromEmployees` in `TimeOffPolicyGetService` for non-admin actors — S
- Frontend — After policy form is audited: identify which passive settings are rendered and add "future" indicators — S
- Both — Define and document the policy create/update DTO explicitly — S

### Readiness Status

PARTIAL — Confidence: High

---

## 14. Final Calendar and Table UI

### Goal for MVP

A polished final view combining calendar and table representations of time off data. Likely a capstone UI block.

### Backend Current State

- Same dependencies as Block 12 — date-range request filtering, resolved calendar endpoint.

### Frontend Current State

- Not found in audit. No dedicated calendar/table combined view.

### Integration Gaps

- Cannot assess — block is undefined in current implementation.

### Technical Decisions Needed

- Is this block required for MVP or is it a post-MVP UI polish item?
- If required: what is the specific screen — a manager view of team time off, or an employee personal calendar?
- Does it overlap with Block 12 (Calendar public holidays + simple time off)?

### MVP Scope Recommendation

- Needs decision: define the block's scope before any implementation.
- Likely depends on Blocks 10, 11, 12 being completed first.

### Readiness Status

NEEDS DECISION — Confidence: Low

---

## 15. Inbox and Notification Engine

### Goal for MVP

Users receive notifications for relevant events (time off submitted, approved, rejected). Managers receive notifications for pending approvals.

### Backend Current State

- Activity logging exists via `ActivityLogService` and `ActivityContext` — events are logged but nothing is sent.
- No notification engine, no email sender, no push notification service.
- No `GET /inbox` or notification list endpoint referenced in backend audit.

### Frontend Current State

- A route `/inbox` exists per the frontend audit ("not analyzed"). No component or data fetching implemented.

### Integration Gaps

- Backend has no notification delivery mechanism. Frontend has a stub route. There is no integration at all.

### Technical Decisions Needed

- Is Inbox/Notification required for MVP or deferred?
- If required: is in-app notification (a notification list at `/inbox`) sufficient, or does email delivery need to be included?
- If in-app only: should notifications be stored in a `notifications` table, or derived from the activity log?
- Should the notification bell in the sidebar show an unread count? Does the count need a real-time update (websocket) or is polling acceptable for MVP?
- Should notification preferences be configurable by the user (e.g., opt-in/out of certain notification types)?

### MVP Scope Recommendation

- Needs decision: whether in-app inbox and/or email notifications are required for MVP.
- If deferred: hide the `/inbox` route to avoid a dead-end page.

### Suggested Next Technical Tasks

- Both — Decide inbox/notification scope for MVP — S — decision required
- Frontend — If deferred: hide or remove the `/inbox` route — S

### Readiness Status

NEEDS DECISION / OUT OF MVP — Confidence: Low

---

## 16. Final Cleanup of Completed Blocks

### Goal for MVP

Before release: remove stub actions, add missing error states, enforce permission guards across all pages, remove debug logs, and ensure consistent empty states.

### Backend Current State

- No specific cleanup tasks — backend is generally consistent.
- Cleanup needed: replace `isAuthenticated()` with proper `hasAuthority()` on Time Off endpoints (applies across Blocks 3, 8, 10, 11).
- Cleanup needed: add self-approval guard.
- Cleanup needed: circular parent check for org units.

### Frontend Current State

- Debug `console.log` in: `AssignedUsersTable.tsx`, `PersonalInfoContainer`, `PersonalDocumentsContainer`, `DepartmentsPage`.
- Stub actions visible in production UI: export in `AssignedUsersModule`, all add actions in `PeopleTopbar`, import in `PeopleTopbar`.
- Empty `ErrorBoundary.tsx` — any thrown errors are uncaught. Containers that throw errors have no boundary.
- Missing `EmptyState` in People Table for zero-results.
- Missing empty states in Departments/Teams trees.
- Missing `PermissionGate` on Departments/Teams settings pages.
- Missing `PermissionGate` on Settings section in sidebar.

### Integration Gaps

- These are cross-cutting quality items, not integration gaps. Each cleanup item belongs to a specific block above.

### Technical Decisions Needed

- Should stub action buttons (export, import, add manually) be removed from the UI for MVP, or left visible with a disabled state and tooltip?
- Should `ErrorBoundary` be implemented as a global layout boundary, per-page boundary, or per-module boundary?
- Should `EmptyState` in People Table show a "no results" message with a clear-filters action when filters are active, vs a "your organization has no employees" message when no filters are active?
- Should debug `console.log` removal be part of a dedicated cleanup PR or addressed as part of each feature block?

### MVP Scope Recommendation

- Include in MVP: remove all debug logs, implement `ErrorBoundary`, add `EmptyState` to People Table, remove or disable all stub action buttons, add `PermissionGate` to unprotected pages.
- Include in MVP (backend): `hasAuthority` on Time Off endpoints, self-approval guard.
- Postpone after MVP: comprehensive empty states for all tree views beyond People Table.

### Suggested Next Technical Tasks

- Frontend — Remove `console.log` from all four identified files — S
- Frontend — Implement `ErrorBoundary.tsx` with inline error display — S
- Frontend — Add `EmptyState` to People Table — S
- Frontend — Audit and remove or disable all stub action buttons — S
- Frontend — Add `PermissionGate` to all unprotected settings pages — S
- Backend — Replace `isAuthenticated()` with `hasAuthority()` on Time Off endpoints — S (covered in Block 3)

### Readiness Status

PARTIAL — Confidence: High

---

## Cross-Block Dependencies

- **Manager Time Off (Block 11)** depends on `managerId` relation (Block 11 task). This single field also affects RBAC ownership guards (Block 3) and any manager-scoped queries in org structure.

- **Calendar View (Blocks 12, 14)** depends on Public Holiday assignment and `resolveCalendarForUser` (Block 7) and on date-range filtering of Time Off requests (Block 10).

- **Time Off request calculation correctness** depends on Public Holiday assignment resolution (Block 7), which depends on the assignment model decision (Block 2).

- **Departments/Teams assignment** (if any entity can be assigned to a department) depends on the OrgUnit membership model decision (Block 1) and the generic assignment model decision (Block 2).

- **People Table bulk actions (Block 6)** depend on role assignment mutation hooks being built (Block 3).

- **User Time Off dashboard (Block 10)** depends on auto-balance creation (Block 8) and the `GET /me/time-off-assignments` endpoint.

- **Role permission save (Block 3)** requires a backend endpoint to be confirmed or created before the frontend mutation can be built.

- **Public Holiday calendar assignment UI (Block 7)** depends on the assignment scope decision (Block 2) before any frontend implementation can begin.

- **Time Off Advanced Settings UI (Block 13)** depends on a policy form audit to determine what is already rendered in the active development branch.

- **Notification Engine (Block 15)**, if in MVP, depends on all other blocks completing event emission — it must be built last.

---

## MVP Decision Checklist

### Data Model Decisions

- [ ] OrgUnit membership model: attribute-based `AttributeValue` (current) or direct `user.orgUnitId` FK?
- [ ] Manager relation model: single nullable `managerId` FK on `User` or a separate manager-relation table?
- [ ] Public Holiday calendar assignment scopes for MVP: company-only, or also department/team/user?
- [ ] `TimeOffPolicyAssignment` scope: add `orgUnitId` for team/department assignment in MVP or remain per-user only?
- [ ] Generic assignment engine: build now or let each domain maintain its own assignment table?
- [ ] `usedBalance` timing: consume on request create (current, has TODO) or on approve?
- [ ] `sort_order` on org units: add now for future drag-drop, or omit and add later with a migration?

### API Contract Decisions

- [ ] `GET /departments` and `GET /teams`: flat list with `parentId` or nested tree?
- [ ] Role permission update: `PUT /roles/{id}/permissions` — full replacement or patch/delta?
- [ ] Available balance field: single computed `availableBalance` from backend or calculated from multiple fields on frontend?
- [ ] Time Off request list filters: what query params are supported (`year`, `status`, `dateRange`)?
- [ ] Calendar assignment resolution: what is the endpoint contract for `GET /users/me/calendar`?

### Access and Security Decisions

- [ ] Which permission code gates the Settings section in the sidebar?
- [ ] What specific permission code (`PERM_ORG_STRUCTURE_VIEW`) is required for Departments/Teams settings pages?
- [ ] Should `PermissionGate` hide actions entirely or show disabled buttons for users without permission?
- [ ] Ownership guard scope: should employees only access their own Time Off data, or can HR admins access any user's data via the same endpoints?
- [ ] Self-approval: hard block on backend, or soft prevention in frontend only?
- [ ] Should multi-role assignment be supported in the `AssignRolesForm` (one user gets multiple roles) or is it one-role-at-a-time?

### Frontend UX Decisions

- [ ] User detail page: side panel/drawer or full page at `/organization/people/[id]`?
- [ ] People Table add user: modal or dedicated page?
- [ ] Stub buttons (export, import, add manually): disable with tooltip or remove entirely for MVP?
- [ ] Department/Team tree node selection: URL-based routing or in-memory state only?
- [ ] Passive policy settings (carryover, renewal): hidden from form, or shown with "coming soon" labels?
- [ ] Role permission save: one Save button for all tabs, or per-tab Save?
- [ ] Reusable `UserPicker`: build once and share across Roles, Time Off, Departments assignment, or build per-module?

### MVP Scope Decisions

- [ ] Attendance (Block 9): in or out of MVP?
- [ ] Calendar view (Block 12, 14): in or out of MVP? If in: scope definition.
- [ ] Inbox/Notifications (Block 15): in or out of MVP? If in: in-app only or also email?
- [ ] Export/Import in People Table: in or out of MVP?
- [ ] Calendar public holiday and weekend exclusion in Time Off `requestedAmount`: in or out of MVP?
- [ ] Multi-step approval in Time Off: in or out of MVP?
- [ ] Yearly balance renewal and carryover processing jobs: in or out of MVP?

---

## Recommended Implementation Order

The order is based on the dependency graph. Items that unblock multiple downstream blocks come first.

1. **Decide OrgUnit membership model** — blocks departments/teams frontend, members endpoints, assignment model. No code until this is decided.

2. **Add `managerId` to User** — migration + DTO exposure. One migration, unblocks MANAGER approver, pending-requests endpoint, manager approval UI.

3. **Harden ownership guards on Time Off** — add `actorUserId == userId` check in request get/list and balance list. Small, no dependencies.

4. **Replace `isAuthenticated()` with `hasAuthority()` on Time Off endpoints** — affects all Time Off controller methods. No dependencies.

5. **Define Public Holiday calendar assignment scope (decision)** — must be decided before migration is written.

6. **Create `public_holiday_calendar_assignments` migration and entity** — depends on scope decision.

7. **Implement `resolveCalendarForUser`** — depends on assignment table.

8. **Add `GET /departments/{id}/members` and `GET /teams/{id}/members` endpoints** — depends on membership model decision.

9. **Wire role assignment mutations on frontend** (`useAssignUserRoles`, `useRemoveUserRole`, connect to `AssignRolesForm` and `AssignedUsersModule`).

10. **Confirm or create `PUT /roles/{id}/permissions` backend endpoint** — then build `useUpdateRolePermissions` mutation and wire to `PermissionsModule` Save button.

11. **Define frontend DTOs for Departments and Teams** — prerequisite for all frontend Departments/Teams work.

12. **Build `useDepartments`, `useTeams` hooks and replace mock data** — depends on DTOs and backend endpoints.

13. **Build CRUD modals for Departments and Teams** — depends on mutation hooks.

14. **Auto-create `EmployeeTimeOffBalance` on policy assignment** — unblocks employee-visible balance.

15. **Add `GET /me/time-off-assignments` and `GET /me/time-off-policies` endpoints** — unblocks employee Time Off dashboard.

16. **Build user Time Off dashboard (frontend)** — depends on balance auto-creation and me/* endpoints.

17. **Implement MANAGER approver resolution** — depends on `managerId`.

18. **Add self-approval guard and `GET /pending-for-approval` endpoint**.

19. **Build manager approval queue screen (frontend)** — depends on pending-for-approval endpoint.

20. **Build Public Holiday calendar assignment UI (frontend)** — depends on assignment endpoint.

21. **Integrate calendar resolution into Time Off request creation** (if in MVP scope — weekend/holiday exclusion).

22. **Frontend cleanup** — remove debug logs, implement ErrorBoundary, add EmptyState, disable/remove stub buttons, add PermissionGate to unprotected pages.

23. **Decide and implement Attendance, Calendar view, Inbox scope** — these are independent tracks that can proceed in parallel once core blocks are stable.

---

*Document generated from Backend MVP Audit Report and Frontend MVP Audit Report. All findings based on static code analysis as of 2026-06-14. Confidence ratings reflect certainty of analysis, not certainty of implementation status.*
