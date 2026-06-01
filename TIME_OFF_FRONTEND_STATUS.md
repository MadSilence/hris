# Time Off Module — Frontend Readiness

*Updated: 2026-06-01 — After Steps 1 & 2 of frontend implementation*

---

## 1. Executive Summary

**What has been built:** Two full layers of the frontend stack are now complete — the server-side API layer and the component-level data layer (services, actions, hooks, query keys).

**Is it real API-backed?** Yes, for everything that has been wired. The actions call the real backend through `hrisApiClient`. The services call real internal Next.js routes (which still need to be created — see gap below). No mock data exists in any new file.

**What is missing:** The React UI layer — containers, components, forms, modals, pages, and the internal Next.js API route files that bridge the component services to the backend. The existing two placeholder pages (`/settings/time/time-off` and the employee profile tab) remain untouched and still contain mock/placeholder content.

**Distance from usable MVP:** The invisible plumbing is complete. The next step is purely UI work, which can now proceed directly — every hook, action, and service it needs is ready.

---

## 2. Full Stack Inventory by Layer

### Layer A — Backend (not owned by frontend team)

| Area | Status |
|---|---|
| Policy CRUD + lifecycle | ✅ Complete |
| Approval settings GET/PUT | ✅ Complete |
| Policy assignments | ✅ Complete |
| Balance create/adjust/read | ✅ Complete |
| Request submit/cancel/approve/reject | ✅ Complete |
| `allowNegativeBalance` in `TimeOffPolicyDTO` | ❌ Missing — field exists on DB entity, not in DTO |
| Approval inbox list endpoint (`GET /api/time-off/requests?status=PENDING`) | ❌ Missing |
| User assignments list endpoint (`GET /api/users/{userId}/time-off-assignments`) | ❌ Missing |
| Policy-level balance list (`GET /api/time-off/policies/{id}/balances`) | ❌ Missing |

---

### Layer B — Server-side API module (`api/modules/timeOff/`)

All five modules live under a single parent folder: `api/modules/timeOff/`.

Each module contains: `clients/`, `dto/`, `mappers/`, `routes/`, `services/`, with full test coverage.

| Module | Endpoints covered | Client | DTOs | Mapper | Routes | Service | Tests |
|---|---|---|---|---|---|---|---|
| `timeOffPolicies` | list, getById, create, update, rename, activate, archive, delete | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `timeOffPolicyApprovalSettings` | getByPolicyId (GET), update (PUT) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `timeOffPolicyAssignments` | listByPolicy, create, end | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `employeeTimeOffBalances` | create, getById, listByUser, adjust, listAdjustments | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `timeOffRequests` | create, getById, listByUser, cancel, approve, reject | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

---

### Layer C — Frontend domain models (`models/timeOff/`)

| Model / Enum | Status |
|---|---|
| `TimeOffPolicy` (interface) | ✅ |
| `TimeOffPolicyStatus` (enum: DRAFT, ACTIVE, ARCHIVED) | ✅ |
| `TimeOffPolicyUnit` (enum: DAYS, HOURS) | ✅ |
| `TimeOffPolicyRenewalType` (enum: YEARLY_FIXED_DATE, MANUAL) | ✅ |
| `TimeOffPolicyCarryoverType` (enum: NONE, UNLIMITED, LIMITED) | ✅ |
| `TimeOffPolicyCarryoverExpiryType` (enum: NEVER, AFTER_PERIOD) | ✅ |
| `TimeOffPolicyCarryoverExpiryUnit` (enum: DAYS, MONTHS) | ✅ |
| `TimeOffPolicyApprovalSettings` (interface) | ✅ |
| `TimeOffPolicyApprover` (interface) | ✅ |
| `TimeOffPolicyApproverType` (enum: MANAGER, SPECIFIC_USER) | ✅ |
| `TimeOffPolicyAssignment` (interface) | ✅ |
| `TimeOffPolicyAssignmentStatus` (enum: ACTIVE, ENDED) | ✅ |
| `EmployeeTimeOffBalance` (interface) | ✅ |
| `EmployeeTimeOffBalanceAdjustment` (interface) | ✅ |
| `TimeOffRequest` (interface) | ✅ |
| `TimeOffRequestStatus` (enum: PENDING, APPROVED, REJECTED, CANCELLED) | ✅ |
| `allowNegativeBalance` on policy | ❌ Intentionally omitted — not in backend DTO yet |

---

### Layer D — Component module (`components/modules/settings/modules/time/timeOff/`)

#### D1 — Query keys and utilities

| File | Status |
|---|---|
| `utils/timeOffQueryKeys.ts` — 9 factory functions + root key | ✅ |
| `utils/assertTimeOffId.ts` — runtime ID guard for hooks | ✅ |

**Query key tree:**
```
["timeOff", "policies"]
["timeOff", "policies", policyId]
["timeOff", "policies", policyId, "approvalSettings"]
["timeOff", "policies", policyId, "assignments"]
["timeOff", "balances", balanceId]
["timeOff", "balances", "user", userId]
["timeOff", "balances", balanceId, "adjustments"]
["timeOff", "requests", requestId]
["timeOff", "requests", "user", userId]
```

#### D2 — Component-level services (client-side, GET only, raw fetch)

| Service | Methods | Tests |
|---|---|---|
| `timeOffPoliciesService` | `list()`, `getById(id)` | ✅ |
| `timeOffPolicyApprovalSettingsService` | `getByPolicyId(policyId)` | ✅ |
| `timeOffPolicyAssignmentsService` | `listByPolicyId(policyId)` | ✅ |
| `employeeTimeOffBalancesService` | `getById(id)`, `listByUserId(userId)`, `listAdjustments(balanceId)` | ✅ |
| `timeOffRequestsService` | `getById(id)`, `listByUserId(userId)` | ✅ |

> These services call internal Next.js routes (e.g. `GET /api/time-off/policies`).
> The **Next.js route files themselves have not been created yet** — this is the only
> missing wiring between the component layer and the backend. Until those routes
> exist, the read services will 404. Mutation actions are unaffected.

#### D3 — Server actions (`"use server"`, call API layer directly)

| Action | Operation | Tests |
|---|---|---|
| `createTimeOffPolicyAction` | create policy | ✅ |
| `updateTimeOffPolicyAction` | update policy config | ✅ |
| `renameTimeOffPolicyAction` | rename (unique key) | ✅ |
| `activateTimeOffPolicyAction` | DRAFT → ACTIVE | ✅ |
| `archiveTimeOffPolicyAction` | ACTIVE → ARCHIVED | ✅ |
| `deleteTimeOffPolicyAction` | delete (DRAFT only) | ✅ |
| `updateTimeOffPolicyApprovalSettingsAction` | replace approver list | ✅ |
| `createTimeOffPolicyAssignmentAction` | assign policy to employee | ✅ |
| `endTimeOffPolicyAssignmentAction` | end an assignment | ✅ |
| `createEmployeeTimeOffBalanceAction` | create annual balance | ✅ |
| `adjustEmployeeTimeOffBalanceAction` | manual adjustment | ✅ |
| `createTimeOffRequestAction` | submit request | ✅ |
| `cancelTimeOffRequestAction` | cancel pending request | ✅ |
| `approveTimeOffRequestAction` | approve pending request | ✅ |
| `rejectTimeOffRequestAction` | reject with reason | ✅ |

#### D4 — TanStack Query hooks

**Read hooks (useQuery):**

| Hook | Query key | Invalidation hook exported |
|---|---|---|
| `useTimeOffPolicies` | `["timeOff", "policies"]` | `useInvalidateTimeOffPoliciesQuery` ✅ |
| `useTimeOffPolicy({ policyId })` | `["timeOff", "policies", policyId]` | via policies invalidate |
| `useTimeOffPolicyApprovalSettings({ policyId })` | `["timeOff", "policies", policyId, "approvalSettings"]` | `useInvalidateTimeOffPolicyApprovalSettingsQuery` ✅ |
| `useTimeOffPolicyAssignments({ policyId })` | `["timeOff", "policies", policyId, "assignments"]` | `useInvalidateTimeOffPolicyAssignmentsQuery` ✅ |
| `useEmployeeTimeOffBalance({ balanceId })` | `["timeOff", "balances", balanceId]` | via balances invalidate |
| `useEmployeeTimeOffBalancesByUser({ userId })` | `["timeOff", "balances", "user", userId]` | `useInvalidateEmployeeTimeOffBalancesQuery` ✅ |
| `useEmployeeTimeOffBalanceAdjustments({ balanceId })` | `["timeOff", "balances", balanceId, "adjustments"]` | via balances invalidate |
| `useTimeOffRequest({ requestId })` | `["timeOff", "requests", requestId]` | via requests invalidate |
| `useTimeOffRequestsByUser({ userId })` | `["timeOff", "requests", "user", userId]` | `useInvalidateTimeOffRequestsQuery` ✅ |

**Mutation hooks (useMutation):**

| Hook | Invalidates on success |
|---|---|
| `useCreateTimeOffPolicy` | `["timeOff", "policies"]` |
| `useUpdateTimeOffPolicy` | `["timeOff", "policies"]` |
| `useRenameTimeOffPolicy` | `["timeOff", "policies"]` |
| `useActivateTimeOffPolicy` | `["timeOff", "policies"]` |
| `useArchiveTimeOffPolicy` | `["timeOff", "policies"]` |
| `useDeleteTimeOffPolicy` | `["timeOff", "policies"]` |
| `useUpdateTimeOffPolicyApprovalSettings` | `["timeOff", "policies", policyId, "approvalSettings"]` (scoped) |
| `useCreateTimeOffPolicyAssignment` | `["timeOff", "policies", policyId, "assignments"]` (scoped) |
| `useEndTimeOffPolicyAssignment` | `["timeOff", "policies", policyId, "assignments"]` (scoped) |
| `useCreateEmployeeTimeOffBalance` | `["timeOff", "balances"]` (root) |
| `useAdjustEmployeeTimeOffBalance` | `["timeOff", "balances"]` (root) |
| `useCreateTimeOffRequest` | `["timeOff", "requests"]` + `["timeOff", "balances"]` |
| `useCancelTimeOffRequest` | `["timeOff", "requests"]` + `["timeOff", "balances"]` |
| `useApproveTimeOffRequest` | `["timeOff", "requests"]` |
| `useRejectTimeOffRequest` | `["timeOff", "requests"]` + `["timeOff", "balances"]` |

---

### Layer E — Next.js internal API routes (`app/api/time-off/…`)

**Status: Not yet created.** These bridge the component-level services to the backend.
Each is ~5–10 lines following the existing Public Holidays route pattern.

| Route file | Methods | Route handler |
|---|---|---|
| `app/api/time-off/policies/route.ts` | GET, POST | `timeOffPoliciesRoutes.list`, `.create` |
| `app/api/time-off/policies/[id]/route.ts` | GET, PATCH | `.getById`, `.update` |
| `app/api/time-off/policies/[id]/rename/route.ts` | POST | `.rename` |
| `app/api/time-off/policies/[id]/activate/route.ts` | POST | `.activate` |
| `app/api/time-off/policies/[id]/archive/route.ts` | POST | `.archive` |
| `app/api/time-off/policies/[id]/delete/route.ts` | POST | `.delete` |
| `app/api/time-off/policies/[policyId]/approval-settings/route.ts` | GET, PUT | `timeOffPolicyApprovalSettingsRoutes.getByPolicyId`, `.update` |
| `app/api/time-off/policies/[policyId]/assignments/route.ts` | GET, POST | `timeOffPolicyAssignmentsRoutes.listByPolicyId`, `.create` |
| `app/api/time-off/policy-assignments/[assignmentId]/end/route.ts` | POST | `.end` |
| `app/api/time-off/balances/route.ts` | POST | `employeeTimeOffBalancesRoutes.create` |
| `app/api/time-off/balances/[id]/route.ts` | GET | `.getById` |
| `app/api/time-off/balances/[id]/adjust/route.ts` | POST | `.adjust` |
| `app/api/time-off/balances/[id]/adjustments/route.ts` | GET | `.listAdjustments` |
| `app/api/users/[userId]/time-off-balances/route.ts` | GET | `.listByUserId` |
| `app/api/time-off/requests/route.ts` | POST | `timeOffRequestsRoutes.create` |
| `app/api/time-off/requests/[id]/route.ts` | GET | `.getById` |
| `app/api/time-off/requests/[id]/cancel/route.ts` | POST | `.cancel` |
| `app/api/time-off/requests/[id]/approve/route.ts` | POST | `.approve` |
| `app/api/time-off/requests/[id]/reject/route.ts` | POST | `.reject` |
| `app/api/users/[userId]/time-off-requests/route.ts` | GET | `.listByUserId` |

---

### Layer F — React UI (containers, components, pages)

**Status: Not yet started.** Both existing page files remain as-is.

| Page / Route | Current state |
|---|---|
| `/settings/time/time-off` | Hardcoded mock page — stats, calendar grid, request cards all static |
| `/settings/time/time-off/[id]` | Route does not exist |
| `/organization/people/[id]/time-off` | `<p>Time Off</p>` placeholder |
| Employee self-service (`/time-off`) | Route does not exist |

---

## 3. Screen-by-Screen Readiness

| Screen | Data layer ready | What is still missing |
|---|---|---|
| **Settings / Policy list** | ✅ `useTimeOffPolicies`, all 6 mutation hooks | Next.js routes (Layer E), container, list component, create modal, skeleton, status badges |
| **Policy detail / overview** | ✅ `useTimeOffPolicy`, update/rename hooks | Route `[id]`, container, tabbed layout, edit form, rename modal |
| **Approval settings** | ✅ `useTimeOffPolicyApprovalSettings`, `useUpdateTimeOffPolicyApprovalSettings` | Approval settings form, approver list UI, product decision on MANAGER type UX |
| **Policy assignments** | ✅ `useTimeOffPolicyAssignments`, create/end hooks | Assignments table, assign employee modal (needs user picker), end confirmation |
| **Balance management (admin)** | ✅ All balance hooks | Balance card, create modal, adjust modal, adjustment history table |
| **Employee self-service — balances** | ✅ `useEmployeeTimeOffBalancesByUser` | Route, container, balance cards per policy |
| **Employee self-service — submit request** | ✅ `useCreateTimeOffRequest` | Submit form, date picker, policy selector, same-year validation |
| **My requests list + cancel** | ✅ `useTimeOffRequestsByUser`, `useCancelTimeOffRequest` | Requests list, status badges, cancel confirmation |
| **Admin request detail — approve/reject** | ✅ `useTimeOffRequest`, approve/reject hooks | Request detail view, approve button, reject modal with reason |
| **Employee profile time-off tab** | ✅ All balance + request hooks | Replace placeholder, scoped to profile `userId` |
| **Approval inbox list** | ❌ Backend endpoint missing | Blocked entirely — no `GET /api/time-off/requests?status=PENDING` |

---

## 4. Recommended Next Steps

### Step 3 — Next.js API route files (unblocks all read hooks)

Create ~20 route files under `app/api/time-off/`. Each is ~8 lines delegating to the
existing route handler classes. Without this, `useTimeOffPolicies` and all other read
hooks will 404 at runtime. Mutation actions already work without them.

### Step 4 — Settings / Policy list UI (first visible screen)

Replace the mock page at `app/(app)/settings/time/time-off/page.tsx` with a real
`TimeOffPoliciesSettingsContainer`. Model it on `PublicHolidaysSettingsContainer`.
Requires: skeleton loader, policy list component, status badge, create policy modal
(Formik + Yup), activate/archive/delete actions with confirmation dialogs.

### Step 5 — Policy detail page + tabs

Create `app/(app)/settings/time/time-off/[id]/page.tsx` with tabs:
Overview → Approval Settings → Assignments → Balances.

### Steps 6–10 — Remaining UI screens

Follow the order in Section 3 above. All data layer is ready; it is purely UI work.

---

## 5. Known Gaps and Risks

| Gap | Impact | Owner |
|---|---|---|
| `allowNegativeBalance` missing from `TimeOffPolicyDTO` | Policy form cannot show this flag; frontend omits it | Backend |
| No approval inbox list endpoint | Approval inbox screen blocked entirely | Backend |
| No user assignments list endpoint | Employee profile cannot show assigned policies | Backend |
| Balance consumed on submit, not on approval | Employee sees balance drop before approval; no pending bucket | Design decision |
| MANAGER approver stored, not executed | Configuring MANAGER has no runtime effect; misleads admins | Product decision on UI copy |
| Multi-step approval not enforced | `allApprovalsRequired` / `approvalOrderStrict` stored but ignored at runtime | Product decision on whether to surface in UI |
| No working-day counting | Requests count calendar days including weekends | Backend (future) |
| Cross-year requests rejected by backend | Dates must be within one calendar year; UI must validate | Frontend (form validation) |
| No accrual engine | Balances are manually seeded only; no automatic quota accrual | Backend (future) |
| `next/jest` config broken in this environment | Tests cannot be run via CLI; pre-existing issue unrelated to Time Off work | Environment |
| TODO comments in 3 request mutation hooks | Balance invalidation uses root key; narrowing requires `balanceId` at call site | Frontend (minor) |
