# Time Off Module — Backend Implementation Reference

*Generated: 2026-06-01 · Based on migrations V11–V16 and all Java source files*

---

# 1. Executive Summary

The Time Off module covers the full lifecycle from policy configuration through employee request resolution. Below is the current implementation status.

**✅ Implemented and usable now**
- Time Off Policy CRUD (create, update, rename, activate, archive, delete)
- Policy approval settings configuration (settings + approver list)
- Policy assignment to employees (create, end)
- Employee balance management (create, manual adjust, read, list adjustment history)
- Time Off Request submission (validation, balance consumption, overlap detection)
- Request cancellation (balance restoration)
- Request approval (admin + `SPECIFIC_USER` approver)
- Request rejection (balance restoration, admin + `SPECIFIC_USER` approver)
- Activity logging for all write operations
- Multi-tenant isolation on every query (companyId filter)

**⚠️ Implemented but simplified / MVP behavior**
- Approval access: admin (`TIME_OFF_POLICY_UPDATE`) or `SPECIFIC_USER` approver only; `MANAGER` type is stored but not resolved
- `approvalOrderStrict` and `allApprovalsRequired` are stored and validated on the settings record but not enforced during approve/reject execution — every approval is single-step
- Balance consumption: `usedBalance` is incremented immediately on request submission (no pending/reserved bucket); the same amount is restored on cancellation or rejection
- Request duration: simple inclusive calendar-day count; no working-day or public-holiday exclusion
- No employee self-service permission level; employees use the `TIME_OFF_POLICY_READ` action to submit/cancel their own requests
- `allowNegativeBalance` flag is stored and enforced at request creation, but `maxNegativeBalance` is not stored

**❌ Not implemented yet**
- Multi-step approval execution (ordered, all-required workflows)
- `MANAGER` approver resolution
- Substitute approvers (`allowSubstituteApprovers` is stored, not enforced)
- Accrual engine (no automatic balance accrual)
- Carryover automation (balances are manually seeded)
- Working-day / public-holiday counting for `requestedAmount`
- Request editing
- Notifications (email, push, in-app)
- Policy templates / default policies
- Policy-level balance listing endpoint (repository method exists, endpoint not exposed)
- Listing all requests company-wide or by status for an approval inbox (repository method exists, endpoint not exposed)
- `allowNegativeBalance` not exposed in `TimeOffPolicyDTO` (field exists on entity, missing from DTO — see §6)

---

# 2. Current Backend Capabilities

## Step 1 — Admin creates a Time Off Policy

**Service chain:** `TimeOffPolicyCreateService`
**Endpoint:** `POST /api/time-off/policies`
**Request:** `CreateTimeOffPolicyRequest`

A policy starts in `DRAFT` status. It must be explicitly activated before it can accept assignments or requests. Policy names are unique per company (case-insensitive). The policy captures all quota, renewal, and carryover configuration at creation time.

## Step 2 — Admin configures approval settings

**Service chain:** `TimeOffPolicyApprovalSettingsGetService`, `TimeOffPolicyApprovalSettingsUpdateService`
**Endpoints:** `GET /api/time-off/policies/{policyId}/approval-settings`, `PUT /api/time-off/policies/{policyId}/approval-settings`

Approval settings are created implicitly when the policy is created. The `PUT` endpoint replaces the entire approver list atomically (deletes existing approvers, inserts new). `approvalOrderStrict` can only be set when `allApprovalsRequired` is also true (enforced by business error `APPROVAL_SETTINGS_ORDER_STRICT_REQUIRES_ALL_APPROVALS`). `SPECIFIC_USER` approvers require a non-null `approverUserId`; `MANAGER` approvers must have a null `approverUserId`. `approvalOrder` values must be unique within the list and positive. Approval settings cannot be modified for archived policies.

## Step 3 — Admin assigns the policy to an employee

**Service chain:** `TimeOffPolicyAssignmentCreateService`, `TimeOffPolicyAssignmentListService`, `TimeOffPolicyAssignmentEndService`
**Endpoints:** `POST /api/time-off/policies/{policyId}/assignments`, `GET /api/time-off/policies/{policyId}/assignments`, `POST /api/time-off/policy-assignments/{assignmentId}/end`

Only one `ACTIVE` assignment per company+policy+user is allowed (partial unique index on database). The policy must be `ACTIVE`, not archived. The assigned user must belong to the company. An assignment can be ended with an optional `effectiveTo` date (defaults to today).

## Step 4 — Admin creates or adjusts employee balance

**Service chain:** `EmployeeTimeOffBalanceCreateService`, `EmployeeTimeOffBalanceAdjustService`, `EmployeeTimeOffBalanceGetService`, `EmployeeTimeOffBalanceListByUserService`, `EmployeeTimeOffBalanceAdjustmentListService`
**Endpoints:** `POST /api/time-off/balances`, `GET /api/time-off/balances/{id}`, `GET /api/users/{userId}/time-off-balances`, `POST /api/time-off/balances/{id}/adjust`, `GET /api/time-off/balances/{id}/adjustments`

A balance belongs to a specific `assignmentId` + `year` pair (unique constraint). Only `ACTIVE` assignments can have new balances created. Manual adjustments add to `adjustedBalance` (which may go negative). Each adjustment is recorded in the `employee_time_off_balance_adjustments` table with a mandatory reason. `currentBalance` is computed (never stored): `opening + accrued + adjusted + carriedOver − used`.

## Step 5 — Employee submits a request

**Service chain:** `TimeOffRequestCreateService`
**Endpoint:** `POST /api/time-off/requests`
**Request:** `CreateTimeOffRequestRequest`

The employee provides their `assignmentId`, `startDate`, `endDate`, and optional `reason`. The service resolves policy and balance automatically from the assignment. Validation includes: assignment must be `ACTIVE`, policy must not be archived, a balance must exist for the request year, dates must be within the same calendar year, no overlap with existing `PENDING` requests for the same policy. `requestedAmount` is computed as inclusive calendar days (`endDate - startDate + 1`). If `allowNegativeBalance = false` on the policy, the request is rejected when `requestedAmount > currentBalance`. On success, `usedBalance` is incremented immediately.

## Step 6 — Employee cancels their own request

**Service chain:** `TimeOffRequestCancelService`
**Endpoint:** `POST /api/time-off/requests/{id}/cancel`
**Request:** `CancelTimeOffRequestRequest` (optional body, optional `cancellationReason`)

Only `PENDING` requests can be cancelled. The actor must own the request or have `TIME_OFF_POLICY_UPDATE`. On cancellation, `usedBalance` is decremented by `requestedAmount` (underflow guard prevents going below zero).

## Step 7 — Approver/admin approves or rejects

**Service chains:** `TimeOffRequestApproveService`, `TimeOffRequestRejectService`
**Access gating:** `TimeOffRequestApprovalAccessService`
**Endpoints:** `POST /api/time-off/requests/{id}/approve`, `POST /api/time-off/requests/{id}/reject`

Only `PENDING` requests can be approved or rejected. Access is granted to actors with `TIME_OFF_POLICY_UPDATE`, or actors listed as a `SPECIFIC_USER` approver for the request's policy. `MANAGER` resolution is a `TODO`. On approval, only status changes (balance is already consumed). On rejection, `usedBalance` is decremented (same as cancellation). Rejection requires a non-blank `rejectionReason`.

---

# 3. Database Model

## Migration Sequence

| Migration | Description |
|-----------|-------------|
| V11 | `time_off_policies` table |
| V12 | `time_off_policy_approval_settings` + `time_off_policy_approvers` |
| V13 | `time_off_policy_assignments` |
| V14 | `employee_time_off_balances` + `employee_time_off_balance_adjustments` |
| V15 | `time_off_requests` + `ALTER time_off_policies ADD allow_negative_balance` |
| V16 | Adds approval/rejection columns to `time_off_requests`, replaces cancellation check with full status consistency check |

---

## `time_off_policies`

**Purpose:** Master leave type definitions per company.

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID PK | |
| `company_id` | UUID NOT NULL | FK → companies |
| `name` | TEXT NOT NULL | Unique per company (case-insensitive) |
| `display_name` | TEXT NOT NULL | |
| `description` | TEXT | Nullable |
| `status` | TEXT | `DRAFT` / `ACTIVE` / `ARCHIVED` |
| `unit` | TEXT | `DAYS` / `HOURS` |
| `is_paid` | BOOLEAN | Default `true` |
| `is_hidden_from_employees` | BOOLEAN | Default `false` |
| `yearly_quota` | NUMERIC(10,2) | Null when `unlimited_quota = true` |
| `unlimited_quota` | BOOLEAN | Default `false` |
| `renewal_type` | TEXT | `YEARLY_FIXED_DATE` / `MANUAL` |
| `renewal_fixed_day` | INTEGER | Required for `YEARLY_FIXED_DATE` |
| `renewal_fixed_month` | INTEGER | Required for `YEARLY_FIXED_DATE` |
| `carryover_type` | TEXT | `NONE` / `UNLIMITED` / `LIMITED` |
| `carryover_limit` | NUMERIC(10,2) | Required when `LIMITED` |
| `carryover_expiry_type` | TEXT | `NEVER` / `AFTER_PERIOD` |
| `carryover_expiry_value` | INTEGER | Required for `AFTER_PERIOD` |
| `carryover_expiry_unit` | TEXT | `DAYS` / `MONTHS` for `AFTER_PERIOD` |
| `allow_negative_balance` | BOOLEAN | Added V15; default `false` |
| `archived_at` | TIMESTAMPTZ | Nullable |
| `archived_by` | UUID | FK → users ON DELETE SET NULL |
| audit columns | | `created_at`, `updated_at`, `created_by`, `updated_by`, `version` |

**Key constraints:** `uq_time_off_policies_company_name (company_id, name)`, multiple CHECK constraints validating quota/renewal/carryover combinations.

---

## `time_off_policy_approval_settings`

**Purpose:** One-to-one extension of a policy defining how approval is collected.

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID PK | |
| `company_id` | UUID NOT NULL | |
| `policy_id` | UUID NOT NULL UNIQUE | FK → time_off_policies |
| `all_approvals_required` | BOOLEAN | Default `true` |
| `approval_order_strict` | BOOLEAN | Default `false`; requires `all_approvals_required = true` |
| `allow_substitute_approvers` | BOOLEAN | Default `false`; stored, not yet enforced |
| audit columns | | |

---

## `time_off_policy_approvers`

**Purpose:** Individual approver entries for a policy's approval settings.

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID PK | |
| `company_id` | UUID NOT NULL | |
| `policy_id` | UUID NOT NULL | FK → time_off_policies |
| `approval_settings_id` | UUID NOT NULL | FK → time_off_policy_approval_settings |
| `approver_type` | TEXT | `MANAGER` / `SPECIFIC_USER` |
| `approver_user_id` | UUID | Required for `SPECIFIC_USER`; null for `MANAGER` |
| `approval_order` | INTEGER NOT NULL | Positive; unique per settings |
| `required` | BOOLEAN | Default `true` |
| audit columns | | |

**Key constraints:** `uq_topa_policy_order (policy_id, approval_order)`, `chk_topa_user_id` (SPECIFIC_USER requires non-null user, MANAGER requires null user).

---

## `time_off_policy_assignments`

**Purpose:** Links a policy to a user for a date range; tracked as active or ended.

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID PK | |
| `company_id` | UUID NOT NULL | |
| `policy_id` | UUID NOT NULL | FK → time_off_policies |
| `user_id` | UUID NOT NULL | FK → users |
| `status` | TEXT | `ACTIVE` / `ENDED` |
| `effective_from` | DATE NOT NULL | |
| `effective_to` | DATE | Null until ended |
| `ended_at` | TIMESTAMPTZ | Null when ACTIVE |
| `ended_by` | UUID | FK → users ON DELETE SET NULL |
| audit columns | | |

**Key constraints:** `ux_topa_asgn_active_company_policy_user (company_id, policy_id, user_id) WHERE status = 'ACTIVE'` — only one active assignment per user+policy. `chk_topa_asgn_ended_consistency` ensures status ↔ `ended_at` coherence.

---

## `employee_time_off_balances`

**Purpose:** Annual balance ledger per assignment. All amounts are NUMERIC(10,2).

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID PK | |
| `company_id` | UUID NOT NULL | |
| `assignment_id` | UUID NOT NULL | FK → time_off_policy_assignments |
| `policy_id` | UUID NOT NULL | Denormalized from assignment |
| `user_id` | UUID NOT NULL | Denormalized from assignment |
| `year` | INTEGER NOT NULL | CHECK 1900–2100 |
| `opening_balance` | NUMERIC(10,2) | ≥ 0 |
| `accrued_balance` | NUMERIC(10,2) | ≥ 0 |
| `used_balance` | NUMERIC(10,2) | ≥ 0; incremented on submit, decremented on cancel/reject |
| `adjusted_balance` | NUMERIC(10,2) | May be negative (manual corrections) |
| `carried_over_balance` | NUMERIC(10,2) | ≥ 0 |
| audit columns | | |

**Key constraints:** `ux_etob_assignment_year (assignment_id, year)` — one balance per assignment per year. `currentBalance` is computed: `opening + accrued + adjusted + carriedOver − used` (never stored).

---

## `employee_time_off_balance_adjustments`

**Purpose:** Immutable audit trail of every manual balance adjustment.

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID PK | |
| `company_id` | UUID NOT NULL | |
| `balance_id` | UUID NOT NULL | FK → employee_time_off_balances ON DELETE CASCADE |
| `assignment_id` | UUID NOT NULL | Denormalized |
| `policy_id` | UUID NOT NULL | Denormalized |
| `user_id` | UUID NOT NULL | Denormalized |
| `adjustment_amount` | NUMERIC(10,2) | ≠ 0 (DB CHECK) |
| `reason` | TEXT NOT NULL | Non-blank (DB CHECK) |
| `created_at` | TIMESTAMP | Set at service layer |
| `created_by` | UUID | |

*No `updated_at` / `version` — append-only.*

---

## `time_off_requests`

**Purpose:** Individual time-off request from an employee against a balance.

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID PK | |
| `company_id` | UUID NOT NULL | |
| `user_id` | UUID NOT NULL | FK → users |
| `policy_id` | UUID NOT NULL | Denormalized |
| `assignment_id` | UUID NOT NULL | FK → time_off_policy_assignments |
| `balance_id` | UUID NOT NULL | FK → employee_time_off_balances |
| `status` | TEXT | `PENDING` / `APPROVED` / `REJECTED` / `CANCELLED` |
| `start_date` | DATE NOT NULL | |
| `end_date` | DATE NOT NULL | ≥ start_date |
| `requested_amount` | NUMERIC(10,2) | > 0; inclusive calendar days |
| `reason` | TEXT | Optional employee comment |
| `cancelled_at` | TIMESTAMPTZ | Set when CANCELLED |
| `cancelled_by` | UUID | FK → users ON DELETE SET NULL |
| `cancellation_reason` | TEXT | Optional |
| `approved_at` | TIMESTAMPTZ | Set when APPROVED (V16) |
| `approved_by` | UUID | FK → users ON DELETE SET NULL (V16) |
| `rejected_at` | TIMESTAMPTZ | Set when REJECTED (V16) |
| `rejected_by` | UUID | FK → users ON DELETE SET NULL (V16) |
| `rejection_reason` | TEXT | Required when REJECTED; non-blank (DB CHECK) (V16) |
| audit columns | | |

**Key constraints:** `chk_tor_status_consistency` (V16) — comprehensive four-way status invariant ensuring only the appropriate timestamp columns are set for each status. `chk_tor_rejection_reason` — `rejection_reason` must be non-blank when status is `REJECTED`.

---

# 4. Domain Model

## Entities

### `TimeOffPolicy`
Central aggregate. Controls all policy behaviour flags. Lifecycle: `DRAFT → ACTIVE → ARCHIVED`. Can only be deleted while in `DRAFT`. Only `ACTIVE` policies accept new assignments. `allowNegativeBalance` controls whether requests can exceed available balance.

Helper methods: `isDraft()`, `isActive()`, `isArchived()`, `activate()`, `markArchived(UUID actorUserId)`

### `TimeOffPolicyApprovalSettings`
One record per policy. Created when the policy is created. Always exists (not nullable). Replaced atomically on every `PUT` — the approver list is deleted and re-inserted.

### `TimeOffPolicyApprover`
Individual approver entry. Ordered by `approvalOrder`. `SPECIFIC_USER` requires `approverUserId`. `MANAGER` requires null `approverUserId`. Type is a hint — only `SPECIFIC_USER` is currently enforced at runtime.

### `TimeOffPolicyAssignment`
Links a user to a policy. One active assignment per user+policy pair enforced by partial unique index. Assignment tracks `effectiveFrom` / `effectiveTo` for temporal scoping.

Helper methods: `isActive()`, `isEnded()`, `end(LocalDate effectiveTo, UUID actorUserId)`

### `EmployeeTimeOffBalance`
Annual balance record per assignment. All five balance components are stored; `currentBalance()` computes the usable amount. `adjustedBalance` is the only component that can go negative. `usedBalance` is incremented on request submission and decremented on cancel/reject.

Helper methods: `currentBalance()`, `applyManualAdjustment(BigDecimal amount)`

### `EmployeeTimeOffBalanceAdjustment`
Append-only log entry for each manual adjustment call. Does not extend `AuditableEntity` — has only `createdAt` and `createdBy`, set explicitly in the service.

### `TimeOffRequest`
The central employee-facing record. Status transitions: `PENDING → APPROVED`, `PENDING → REJECTED`, `PENDING → CANCELLED`. No transitions from terminal states.

Helper methods: `isPending()`, `isCancelled()`, `isApproved()`, `isRejected()`, `cancel(UUID, String)`, `approve(UUID)`, `reject(UUID, String)`

---

## Enums

| Enum | Values |
|------|--------|
| `TimeOffPolicyStatus` | `DRAFT`, `ACTIVE`, `ARCHIVED` |
| `TimeOffPolicyUnit` | `DAYS`, `HOURS` |
| `TimeOffPolicyRenewalType` | `YEARLY_FIXED_DATE`, `MANUAL` |
| `TimeOffPolicyCarryoverType` | `NONE`, `UNLIMITED`, `LIMITED` |
| `TimeOffPolicyCarryoverExpiryType` | `NEVER`, `AFTER_PERIOD` |
| `TimeOffPolicyCarryoverExpiryUnit` | `DAYS`, `MONTHS` |
| `TimeOffPolicyApproverType` | `MANAGER`, `SPECIFIC_USER` |
| `TimeOffPolicyAssignmentStatus` | `ACTIVE`, `ENDED` |
| `TimeOffRequestStatus` | `PENDING`, `APPROVED`, `REJECTED`, `CANCELLED` |

---

# 5. API Surface for Frontend

## Time Off Types / Policies Screen

| Method | Path | Purpose | Response |
|--------|------|---------|---------|
| `POST` | `/api/time-off/policies` | Create policy | `BaseCreateResponse { id }` |
| `GET` | `/api/time-off/policies` | List all non-deleted policies | `List<TimeOffPolicyDTO>` |
| `GET` | `/api/time-off/policies/{id}` | Get single policy | `TimeOffPolicyDTO` |
| `PATCH` | `/api/time-off/policies/{id}` | Update policy configuration | `BaseUpdateResponse { id }` |
| `POST` | `/api/time-off/policies/{id}/rename` | Rename (name is the unique key, separate endpoint) | `BaseUpdateResponse { id }` |
| `POST` | `/api/time-off/policies/{id}/activate` | Draft → Active | `BaseUpdateResponse { id }` |
| `POST` | `/api/time-off/policies/{id}/archive` | Active → Archived | `BaseUpdateResponse { id }` |
| `POST` | `/api/time-off/policies/{id}/delete` | Delete (DRAFT only) | `BaseUpdateResponse { id }` |

> ⚠️ **Missing for frontend:** `allowNegativeBalance` is not currently returned in `TimeOffPolicyDTO`. The field is on the entity; the DTO needs to be updated before the frontend can display or edit this flag.

---

## Policy Approval Settings Screen

| Method | Path | Purpose | Response |
|--------|------|---------|---------|
| `GET` | `/api/time-off/policies/{policyId}/approval-settings` | Get current settings + approvers | `TimeOffPolicyApprovalSettingsDTO` |
| `PUT` | `/api/time-off/policies/{policyId}/approval-settings` | Replace settings + approver list | `TimeOffPolicyApprovalSettingsDTO` |

**Request shape for `PUT`:**
```json
{
  "allApprovalsRequired": true,
  "approvalOrderStrict": false,
  "allowSubstituteApprovers": false,
  "approvers": [
    {
      "approverType": "SPECIFIC_USER",
      "approverUserId": "uuid",
      "approvalOrder": 1,
      "required": true
    },
    {
      "approverType": "MANAGER",
      "approverUserId": null,
      "approvalOrder": 2,
      "required": false
    }
  ]
}
```

**Response shape:**
```json
{
  "policyId": "uuid",
  "allApprovalsRequired": true,
  "approvalOrderStrict": false,
  "allowSubstituteApprovers": false,
  "approvers": [
    {
      "id": "uuid",
      "approverType": "SPECIFIC_USER",
      "approverUserId": "uuid",
      "approvalOrder": 1,
      "required": true
    }
  ]
}
```

---

## Policy Assignments Screen

| Method | Path | Purpose | Response |
|--------|------|---------|---------|
| `GET` | `/api/time-off/policies/{policyId}/assignments` | List all assignments for a policy | `List<TimeOffPolicyAssignmentDTO>` |
| `POST` | `/api/time-off/policies/{policyId}/assignments` | Assign policy to user | `BaseCreateResponse { id }` |
| `POST` | `/api/time-off/policy-assignments/{assignmentId}/end` | End an assignment | `BaseUpdateResponse { id }` |

> ⚠️ **Missing:** No endpoint to list a user's assignments directly. `GET /api/users/{userId}/time-off-assignments` would be useful for the employee profile screen.

**Create request shape:**
```json
{
  "userId": "uuid",
  "effectiveFrom": "2026-01-01",
  "effectiveTo": null
}
```

**End request shape** (body optional):
```json
{ "effectiveTo": "2026-06-30" }
```

---

## Employee Balances Screen

| Method | Path | Purpose | Response |
|--------|------|---------|---------|
| `POST` | `/api/time-off/balances` | Create annual balance for an assignment | `BaseCreateResponse { id }` |
| `GET` | `/api/time-off/balances/{id}` | Get single balance | `EmployeeTimeOffBalanceDTO` |
| `GET` | `/api/users/{userId}/time-off-balances` | List all balances for a user (all years, all policies) | `List<EmployeeTimeOffBalanceDTO>` |
| `POST` | `/api/time-off/balances/{id}/adjust` | Apply a manual adjustment | `BaseUpdateResponse { id }` |
| `GET` | `/api/time-off/balances/{id}/adjustments` | List adjustment history | `List<EmployeeTimeOffBalanceAdjustmentDTO>` |

> ⚠️ **Missing:** No endpoint to list balances for a specific policy+year across all employees (`GET /api/time-off/policies/{policyId}/balances?year=2026`). The repository method `findAllByCompanyIdAndPolicyIdAndYear` exists and could be wired up.

**Create balance request shape:**
```json
{
  "assignmentId": "uuid",
  "year": 2026,
  "openingBalance": 20.00,
  "accruedBalance": 0.00,
  "carriedOverBalance": 5.00,
  "adjustedBalance": 0.00
}
```

**Adjust request shape:**
```json
{
  "adjustmentAmount": -2.00,
  "reason": "Correction for unauthorized absence"
}
```

**Balance DTO shape:**
```json
{
  "id": "uuid",
  "assignmentId": "uuid",
  "policyId": "uuid",
  "userId": "uuid",
  "year": 2026,
  "openingBalance": 20.00,
  "accruedBalance": 0.00,
  "usedBalance": 5.00,
  "adjustedBalance": -2.00,
  "carriedOverBalance": 5.00,
  "currentBalance": 18.00,
  "createdAt": "2026-01-01T10:00:00",
  "updatedAt": "2026-06-01T10:00:00"
}
```

---

## Employee Request Flow

| Method | Path | Purpose | Response |
|--------|------|---------|---------|
| `POST` | `/api/time-off/requests` | Submit a request | `BaseCreateResponse { id }` |
| `GET` | `/api/time-off/requests/{id}` | Get single request | `TimeOffRequestDTO` |
| `GET` | `/api/users/{userId}/time-off-requests` | List user's requests (ordered by startDate desc) | `List<TimeOffRequestDTO>` |
| `POST` | `/api/time-off/requests/{id}/cancel` | Cancel a pending request | `BaseUpdateResponse { id }` |

**Create request shape:**
```json
{
  "assignmentId": "uuid",
  "startDate": "2026-07-14",
  "endDate": "2026-07-18",
  "reason": "Summer vacation"
}
```

**Cancel request shape** (body optional):
```json
{ "cancellationReason": "Plans changed" }
```

---

## Approval Inbox / Admin Request Review

| Method | Path | Purpose | Response |
|--------|------|---------|---------|
| `POST` | `/api/time-off/requests/{id}/approve` | Approve a pending request (no body) | `BaseUpdateResponse { id }` |
| `POST` | `/api/time-off/requests/{id}/reject` | Reject a pending request | `BaseUpdateResponse { id }` |

> ❌ **Missing:** No endpoint to list all PENDING requests for the company or for an approver. `GET /api/time-off/requests?status=PENDING` or similar is needed for an approval inbox. The repository method `findAllByCompanyIdAndStatusOrderByCreatedAtDesc` exists and needs a controller endpoint.

**Reject request shape:**
```json
{ "rejectionReason": "Insufficient notice period" }
```

---

# 6. DTO Reference

## Request DTOs

### `CreateTimeOffPolicyRequest`
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `name` | String | ✅ | Unique per company |
| `displayName` | String | ✅ | |
| `description` | String | ❌ | |
| `status` | `TimeOffPolicyStatus` | ✅ | `DRAFT` or `ACTIVE` |
| `unit` | `TimeOffPolicyUnit` | ✅ | `DAYS` / `HOURS` |
| `paid` | Boolean | ✅ | |
| `hiddenFromEmployees` | Boolean | ✅ | |
| `yearlyQuota` | BigDecimal | conditional | Null when `unlimitedQuota = true` |
| `unlimitedQuota` | Boolean | ✅ | |
| `renewalType` | `TimeOffPolicyRenewalType` | ✅ | |
| `renewalFixedDay` | Integer | conditional | Required for `YEARLY_FIXED_DATE` |
| `renewalFixedMonth` | Integer | conditional | Required for `YEARLY_FIXED_DATE` |
| `carryoverType` | `TimeOffPolicyCarryoverType` | ✅ | |
| `carryoverLimit` | BigDecimal | conditional | Required for `LIMITED` |
| `carryoverExpiryType` | `TimeOffPolicyCarryoverExpiryType` | ✅ | |
| `carryoverExpiryValue` | Integer | conditional | Required for `AFTER_PERIOD` |
| `carryoverExpiryUnit` | `TimeOffPolicyCarryoverExpiryUnit` | conditional | Required for `AFTER_PERIOD` |

### `UpdateTimeOffPolicyRequest`
Same fields as `CreateTimeOffPolicyRequest` except no `name` (use `/rename` for that) and no `status` (use `/activate` / `/archive`).

### `RenameTimeOffPolicyRequest`
| Field | Type | Required |
|-------|------|----------|
| `name` | String | ✅ |

### `UpdateTimeOffPolicyApprovalSettingsRequest`
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `allApprovalsRequired` | boolean | ✅ | |
| `approvalOrderStrict` | boolean | ✅ | Requires `allApprovalsRequired = true` |
| `allowSubstituteApprovers` | boolean | ✅ | |
| `approvers` | `List<UpdateTimeOffPolicyApproverRequest>` | ✅ | Must not be empty |

### `UpdateTimeOffPolicyApproverRequest`
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `approverType` | `TimeOffPolicyApproverType` | ✅ | |
| `approverUserId` | UUID | conditional | Required for `SPECIFIC_USER`; null for `MANAGER` |
| `approvalOrder` | Integer | ✅ | Positive; unique in list |
| `required` | boolean | ✅ | |

### `CreateTimeOffPolicyAssignmentRequest`
| Field | Type | Required |
|-------|------|----------|
| `userId` | UUID | ✅ |
| `effectiveFrom` | LocalDate | ✅ |
| `effectiveTo` | LocalDate | ❌ |

### `EndTimeOffPolicyAssignmentRequest`
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `effectiveTo` | LocalDate | ❌ | Defaults to today |

### `CreateEmployeeTimeOffBalanceRequest`
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `assignmentId` | UUID | ✅ | Must be ACTIVE assignment |
| `year` | Integer | ✅ | 1900–2100 |
| `openingBalance` | BigDecimal | ❌ | Defaults to 0; must be ≥ 0 |
| `accruedBalance` | BigDecimal | ❌ | Defaults to 0; must be ≥ 0 |
| `carriedOverBalance` | BigDecimal | ❌ | Defaults to 0; must be ≥ 0 |
| `adjustedBalance` | BigDecimal | ❌ | Defaults to 0; may be negative |

### `AdjustEmployeeTimeOffBalanceRequest`
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `adjustmentAmount` | BigDecimal | ✅ | Non-zero |
| `reason` | String | ✅ | Non-blank |

### `CreateTimeOffRequestRequest`
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `assignmentId` | UUID | ✅ | Must be ACTIVE |
| `startDate` | LocalDate | ✅ | |
| `endDate` | LocalDate | ✅ | ≥ startDate; same year as startDate |
| `reason` | String | ❌ | |

### `CancelTimeOffRequestRequest`
| Field | Type | Required |
|-------|------|----------|
| `cancellationReason` | String | ❌ |

### `RejectTimeOffRequestRequest`
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `rejectionReason` | String | ✅ | Non-blank |

---

## Response DTOs

### `TimeOffPolicyDTO`
`id`, `companyId`, `name`, `displayName`, `description`, `status`, `unit`, `paid`, `hiddenFromEmployees`, `yearlyQuota`, `unlimitedQuota`, `renewalType`, `renewalFixedDay`, `renewalFixedMonth`, `carryoverType`, `carryoverLimit`, `carryoverExpiryType`, `carryoverExpiryValue`, `carryoverExpiryUnit`, `archivedAt`, `archivedBy`, `createdAt`, `updatedAt`, `createdBy`, `updatedBy`, `version`

> ⚠️ **`allowNegativeBalance` is missing from this DTO.** The field exists on the entity but was not included in the DTO. Frontend cannot read or display this flag until the DTO is updated.

### `TimeOffPolicyApprovalSettingsDTO`
`policyId`, `allApprovalsRequired`, `approvalOrderStrict`, `allowSubstituteApprovers`, `approvers: List<TimeOffPolicyApproverDTO>`

### `TimeOffPolicyApproverDTO`
`id`, `approverType`, `approverUserId` (nullable for MANAGER), `approvalOrder`, `required`

### `TimeOffPolicyAssignmentDTO`
`id`, `policyId`, `userId`, `status`, `effectiveFrom`, `effectiveTo` (nullable), `endedAt` (nullable), `endedBy` (nullable), `createdAt`, `updatedAt`

### `EmployeeTimeOffBalanceDTO`
`id`, `assignmentId`, `policyId`, `userId`, `year`, `openingBalance`, `accruedBalance`, `usedBalance`, `adjustedBalance`, `carriedOverBalance`, `currentBalance` (computed), `createdAt`, `updatedAt`

### `EmployeeTimeOffBalanceAdjustmentDTO`
`id`, `balanceId`, `adjustmentAmount`, `reason`, `createdAt`, `createdBy`

### `TimeOffRequestDTO`
`id`, `userId`, `policyId`, `assignmentId`, `balanceId`, `status`, `startDate`, `endDate`, `requestedAmount`, `reason` (nullable), `cancelledAt` (nullable), `cancelledBy` (nullable), `cancellationReason` (nullable), `approvedAt` (nullable), `approvedBy` (nullable), `rejectedAt` (nullable), `rejectedBy` (nullable), `rejectionReason` (nullable), `createdAt`, `updatedAt`

### `BaseCreateResponse`
`{ "id": "uuid" }`

### `BaseUpdateResponse`
`{ "id": "uuid" }`

---

# 7. Business Rules

## Policy Rules

- Status lifecycle: `DRAFT → ACTIVE → ARCHIVED`. Activation is required before assignments or requests.
- Deletion: only allowed while in `DRAFT` status; must have no active assignments (`TIME_OFF_POLICY_IN_USE` error).
- Name is unique per company (case-insensitive). Renaming checks the existing name unchanged rule — cannot rename to the same name.
- `unlimitedQuota = true` requires `yearlyQuota = null`.
- `renewalType = YEARLY_FIXED_DATE` requires both `renewalFixedDay` and `renewalFixedMonth`.
- `carryoverType = LIMITED` requires `carryoverLimit`.
- `carryoverExpiryType = AFTER_PERIOD` requires `carryoverExpiryValue` and `carryoverExpiryUnit`.
- Archived policies cannot be updated, assigned, or have requests submitted against them.

## Approval Settings Rules

- Approver list must not be empty when saving settings.
- `approvalOrderStrict = true` requires `allApprovalsRequired = true`.
- `SPECIFIC_USER` approver must have a non-null `approverUserId`.
- `MANAGER` approver must have a null `approverUserId`.
- `approvalOrder` values must be positive and unique within the list.
- Duplicate `approvalOrder` values are rejected.
- Approval settings cannot be modified for archived policies.

## Assignment Rules

- Only one `ACTIVE` assignment per company+policy+user (partial unique index).
- Policy must be `ACTIVE` (not `DRAFT`, not `ARCHIVED`) to create an assignment.
- User must belong to the company.
- `effectiveFrom` is required.
- `effectiveTo`, if provided at creation, must be ≥ `effectiveFrom`.
- Ending an assignment: `effectiveTo` defaults to today if not provided; it cannot be before `effectiveFrom`.
- Ended assignments can still be read; their balances can still be read; new balances cannot be created for ended assignments.

## Balance Rules

- One balance per `assignment_id` + `year` pair.
- Balances can only be created for `ACTIVE` assignments.
- `year` must be in range 1900–2100.
- `openingBalance`, `accruedBalance`, `carriedOverBalance` must be ≥ 0.
- `adjustedBalance` may be negative (to support corrections).
- `usedBalance` is always ≥ 0 (DB CHECK); it starts at 0 and is only modified by the request lifecycle.
- `currentBalance` formula: `openingBalance + accruedBalance + adjustedBalance + carriedOverBalance − usedBalance`
- Manual adjustment (`/adjust`): adds `adjustmentAmount` to `adjustedBalance`. Creates an audit record in `employee_time_off_balance_adjustments`. `adjustmentAmount` must be non-zero. `reason` must be non-blank.
- Reading balances for ended assignments is allowed.

## Request Rules

- Assignment must be `ACTIVE` at submission time.
- Policy must not be `ARCHIVED`.
- A balance must exist for the request's year (`startDate.year`).
- `startDate` and `endDate` must be in the same calendar year (cross-year requests rejected).
- `endDate` must be ≥ `startDate`.
- `requestedAmount` is computed as: `DAYS_BETWEEN(startDate, endDate) + 1` (inclusive calendar days, scale 2).
- If `policy.allowNegativeBalance = false`: request is rejected when `requestedAmount > currentBalance`.
- If `policy.allowNegativeBalance = true`: request is allowed regardless of current balance.
- Overlap detection: a new `PENDING` request is rejected if an existing `PENDING` request for the same company+user+policy overlaps the date range. Detection is service-level only (no DB constraint).
- On successful submission, `balance.usedBalance` is incremented by `requestedAmount` immediately.
- Status lifecycle: `PENDING` is the only initial state. Terminal states are `APPROVED`, `REJECTED`, `CANCELLED`. No transitions from terminal states.
- **Cancellation:** only `PENDING` requests can be cancelled. `usedBalance` is decremented. Underflow (result < 0) is rejected.
- **Approval:** only `PENDING` requests can be approved. Balance is unchanged (already consumed at submit). No body required.
- **Rejection:** only `PENDING` requests can be rejected. `usedBalance` is decremented. Underflow rejected. `rejectionReason` is required and non-blank.

## Access Rules

- All Time Off endpoints require `isAuthenticated()`.
- Read operations (`GET`) require `TIME_OFF_POLICY_READ` permission.
- Write operations on policies/assignments/balances require `TIME_OFF_POLICY_UPDATE`.
- **Request submission (own request):** requires `TIME_OFF_POLICY_READ` (actor == `assignment.userId`). An admin submitting on behalf of another user requires `TIME_OFF_POLICY_UPDATE`.
- **Request cancellation (own request):** requires `TIME_OFF_POLICY_READ`. Admin cancelling another user's request requires `TIME_OFF_POLICY_UPDATE`.
- **Approve/Reject:** requires `TIME_OFF_POLICY_UPDATE` OR actor is a `SPECIFIC_USER` approver configured for the request's policy.
- `MANAGER` approver resolution: stored in DB but not evaluated at runtime (TODO).
- `allowSubstituteApprovers`: stored but not enforced.

---

# 8. Activity Logging

All events are emitted via `ActivityLogService` with an `ActivityContext` carrying `companyId`, `actorUserId`, `objectType`, `objectId`, and `metadata` map. All events are in the `TimeOffPolicyActivityEvent` enum.

## Policy Events (`TIME_OFF_POLICY` category)

| Event | Trigger | Key Metadata |
|-------|---------|--------------|
| `TIME_OFF_POLICY_CREATED` | Policy creation | `name`, `displayName`, `status` |
| `TIME_OFF_POLICY_UPDATED` | Policy configuration update | |
| `TIME_OFF_POLICY_RENAMED` | Policy rename | `oldName`, `newName` |
| `TIME_OFF_POLICY_ACTIVATED` | Draft → Active | |
| `TIME_OFF_POLICY_ARCHIVED` | Active → Archived | `archivedBy` |
| `TIME_OFF_POLICY_DELETED` | Policy deletion | |
| `TIME_OFF_POLICY_APPROVAL_SETTINGS_UPDATED` | Approval settings PUT | `policyId` |

## Assignment Events (`TIME_OFF_POLICY_ASSIGNMENT` category)

| Event | Trigger | Key Metadata |
|-------|---------|--------------|
| `TIME_OFF_POLICY_ASSIGNMENT_CREATED` | Assignment created | `policyId`, `userId`, `effectiveFrom`, `effectiveTo` |
| `TIME_OFF_POLICY_ASSIGNMENT_ENDED` | Assignment ended | `policyId`, `userId`, `effectiveFrom`, `effectiveTo`, `endedBy` |

## Balance Events (`EMPLOYEE_TIME_OFF_BALANCE` category)

| Event | Trigger | Key Metadata |
|-------|---------|--------------|
| `EMPLOYEE_TIME_OFF_BALANCE_CREATED` | Balance created | `balanceId`, `assignmentId`, `policyId`, `userId`, `year` |
| `EMPLOYEE_TIME_OFF_BALANCE_ADJUSTED` | Manual adjustment | `balanceId`, `adjustmentAmount`, `reason`, `newCurrentBalance` |

## Request Events (`TIME_OFF_REQUEST` category)

| Event | Trigger | Key Metadata |
|-------|---------|--------------|
| `TIME_OFF_REQUEST_CREATED` | Request submitted | `requestId`, `userId`, `policyId`, `assignmentId`, `balanceId`, `startDate`, `endDate`, `requestedAmount` |
| `TIME_OFF_REQUEST_CANCELLED` | Request cancelled | `requestId`, `userId`, `policyId`, `requestedAmount`, `cancellationReason` |
| `TIME_OFF_REQUEST_APPROVED` | Request approved | `requestId`, `userId`, `policyId`, `assignmentId`, `balanceId`, `requestedAmount`, `approvedBy` |
| `TIME_OFF_REQUEST_REJECTED` | Request rejected | `requestId`, `userId`, `policyId`, `assignmentId`, `balanceId`, `requestedAmount`, `rejectedBy`, `rejectionReason` |

---

# 9. Current MVP Limitations

| Area | Limitation |
|------|-----------|
| **Approval execution** | No multi-step approval. A single approve/reject finalises the request regardless of `allApprovalsRequired` or `approvalOrderStrict`. These fields are stored and validated on save but not enforced during approval. |
| **MANAGER approver** | `MANAGER` approver type is accepted in settings and stored in DB. It is not resolved at runtime. Approving as a manager has no effect — only `TIME_OFF_POLICY_UPDATE` permission or `SPECIFIC_USER` match grants approval access. |
| **Substitute approvers** | `allowSubstituteApprovers` is stored, not enforced. |
| **Balance buckets** | Only `usedBalance` is affected by the request lifecycle. There is no `pendingBalance` or `reservedBalance` bucket. `usedBalance` is consumed on submit, not on approval. This means a PENDING request already reduces available balance. If multi-step approval is added later, the balance model will need to be extended. |
| **Request editing** | No endpoint to edit a submitted request (dates, reason). |
| **Accrual engine** | `accruedBalance` is manually set. No automatic periodic accrual. |
| **Carryover automation** | `carriedOverBalance` is manually set. No automatic carryover at year end. |
| **Working-day counting** | `requestedAmount` is inclusive calendar days only. Weekends and public holidays are not excluded. |
| **Public holiday exclusion** | Public Holidays module exists separately. No integration with Time Off request counting yet. |
| **Cross-year requests** | Explicitly rejected. A single request must fall within one calendar year. |
| **Approval inbox endpoint** | `GET /api/time-off/requests?status=PENDING` does not exist. The repository supports the query; no controller endpoint is wired. |
| **Policy-level balance listing** | No endpoint to list all balances for a policy+year. Repository method exists. |
| **User assignments listing** | No `GET /api/users/{userId}/time-off-assignments` endpoint. |
| **`allowNegativeBalance` in DTO** | Field exists on entity and DB; missing from `TimeOffPolicyDTO`. |
| **Notifications** | No email, push, or in-app notifications on any event. |
| **Policy templates** | No default or template policies. Every policy is created from scratch. |
| **`maxNegativeBalance`** | Not implemented. `allowNegativeBalance = true` allows unlimited negative balance. |
| **Self-service permission level** | No dedicated employee self-service permission. Employees use the same `TIME_OFF_POLICY_READ` that admins use. |

---

# 10. Frontend Readiness Assessment

## Which screens can be built now?

**Fully backed, build immediately:**
- Time Off Policy list and create/edit form
- Policy detail page (all configuration fields)
- Approval settings form (approver list management)
- Policy assignment management (assign, end assignment)
- Employee balance management (create balance, view balance, adjust, adjustment history)
- Employee "My Requests" page (submit, view, cancel)
- Admin/approver single-request detail with approve/reject actions

**Mostly backed, minor gaps:**
- Employee profile time-off tab — can show balances and requests; missing direct assignments list endpoint
- Admin request review — can process individual requests; missing the request list/inbox endpoint

## Which screens require missing endpoints?

| Screen | Missing endpoint | Impact |
|--------|-----------------|--------|
| Approval inbox | `GET /api/time-off/requests` with status filter | Approvers cannot see pending requests without knowing the IDs |
| Policy edit form | `allowNegativeBalance` missing from `TimeOffPolicyDTO` | Checkbox cannot be shown or edited |
| Employee profile tab | `GET /api/users/{userId}/time-off-assignments` | Cannot list which policies a user is assigned to |
| Admin balance overview | `GET /api/time-off/policies/{policyId}/balances?year=` | Cannot see all employees' balances for a policy |

## Frontend assumptions to make

- `BaseCreateResponse` and `BaseUpdateResponse` both return only `{ "id": "uuid" }`. After a write operation, make a separate `GET` call if you need the full updated state.
- `currentBalance` in `EmployeeTimeOffBalanceDTO` is computed server-side. Do not attempt to compute it client-side.
- All timestamps in `LocalDateTime` format (`created_at`, `updated_at`) are UTC. Timestamps in `OffsetDateTime` format (`cancelled_at`, `approved_at`, `rejected_at`, `ended_at`) include timezone offset.
- Status fields are plain strings matching enum names exactly (`PENDING`, `APPROVED`, etc.).
- A balance must be manually created before an employee can submit a request. The UI should guide admins to create a balance for the current year after assigning a policy.

## UX limitations to communicate to users

- Requests span one calendar year only. Multi-year leave must be submitted as two separate requests.
- Balance is immediately consumed on submission, not on approval. An employee sees their available balance decrease the moment they submit, even before approval.
- Approval is currently single-step. Even if multiple approvers are configured, any one configured approver (or an admin) can approve or reject.
- Days are counted as calendar days — weekends are included in the requested amount.
- If a request is rejected, the balance is restored automatically.

---

# 11. Recommended Frontend Build Order

### 1. Time Off Types list + create/edit (Policy screen)

**Why first:** Every other feature depends on a policy existing. No assignments, balances, or requests are possible without a policy. Building this first also allows QA to start testing the data foundation.

### 2. Policy detail page + approval settings form

**Why second:** Approval settings are always created alongside the policy. Completing the settings form before moving to assignments means the approval workflow is configured from the start, avoiding incomplete data during testing.

### 3. Policy assignment management (assign/end)

**Why third:** Assignments are the link between policies and employees. Balance creation and request submission both depend on an assignment existing. This is the admin's next step after configuring a policy.

### 4. Employee balance management

**Why fourth:** A balance must exist before a request can be submitted. Building the balance screen (create, view, adjust) allows admins to seed balances, which then unlocks the request flow for QA.

> **Note:** After this step, flag to backend that `allowNegativeBalance` needs to be added to `TimeOffPolicyDTO` so the balance behaviour is visible in the policy form.

### 5. Employee self-service — request submission + "My Requests"

**Why fifth:** With policies, assignments, and balances in place, the request flow can be tested end-to-end. This is the highest-value employee-facing screen. Submission + list + cancellation can all be built from existing endpoints.

### 6. Admin / approver — single request detail + approve/reject

**Why sixth:** Individual request approval works now. Build a minimal detail page where an admin can navigate to a request by ID and approve or reject.

### 7. Approval inbox

**Why seventh (blocked):** Requires the missing `GET /api/time-off/requests?status=PENDING` endpoint. This should be a P0 backend addition — request it immediately. Once available, build the inbox as a table of pending requests with approve/reject inline actions.

### 8. Employee profile time-off tab

**Why eighth:** Aggregates balances, assignments, and requests per employee for HR admin use. Low effort once individual screens exist; blocked only by the missing `GET /api/users/{userId}/time-off-assignments` endpoint.

---

# 12. Remaining Backend Backlog

## P0 — Blocks frontend MVP

| Item | Why it blocks |
|------|--------------|
| `GET /api/time-off/requests?status=PENDING` (or `GET /api/time-off/requests/pending`) | Approval inbox screen cannot list requests without this |
| Add `allowNegativeBalance` to `TimeOffPolicyDTO` | Policy create/edit form cannot show or configure this flag |
| `GET /api/users/{userId}/time-off-assignments` | Employee profile and balance creation flow assume visible assignments |

## P1 — Important after MVP

| Item | Reason |
|------|--------|
| `GET /api/time-off/policies/{policyId}/balances?year=` | Admin balance overview across all employees for a policy |
| `MANAGER` approver resolution | Configured by admins but silently ignored at runtime; misleads users |
| Request list with filtering (year, status, policy) for admin | HR operations |
| `maxNegativeBalance` on policy | `allowNegativeBalance = true` currently allows unbounded negative balance |
| Employee self-service permission tier | Currently employees use the same access action as admins |
| GET balance by `assignmentId` + `year` without knowing `balanceId` | Frontend needs to find the current year's balance from assignment context |

## P2 — Advanced / future

| Item | Reason |
|------|--------|
| Multi-step approval execution (ordered, all-required) | Full enforcement of `approvalOrderStrict` + `allApprovalsRequired` |
| Approval history / audit trail per request | Visibility into who approved at which step |
| Substitute approvers | `allowSubstituteApprovers` is stored; needs runtime resolution |
| Accrual engine | Automatic monthly/yearly accrual to `accruedBalance` |
| Carryover automation | Year-end carryover to new balance |
| Working-day counting mode | Exclude weekends from `requestedAmount` |
| Public holiday exclusion in `requestedAmount` | Integration point with the separate Public Holiday module |
| Request editing | Allow changes to dates/reason before approval |
| Notifications (email/push) | On submission, approval, rejection, cancellation |
| Policy templates | Predefined common leave types (Annual, Sick, etc.) |
| Cross-year requests | Split or span-year request handling |
| Pending/reserved balance bucket | Separating consumed balance from pending requests |

---

# 13. Risks / Design Notes

### Immediate `usedBalance` consumption

The current design decrements `usedBalance` on submission, not on approval. This is simple but creates a user experience problem: a PENDING request that is later rejected still holds the employee's balance hostage until the rejection occurs. If approval is slow, employees see their available balance as lower than it actually is (in a useful sense).

**Future mitigation path:** Introduce a `pendingBalance` column on `employee_time_off_balances` and move the consumption point to approval. Rejection/cancellation would then decrement `pendingBalance` instead of `usedBalance`. This is a schema change that will require a migration and updates to all four request-lifecycle services.

### No reserved balance bucket

Currently `currentBalance = opening + accrued + adjusted + carriedOver − used`. There is no separation between "pending" and "confirmed used" amounts. When multi-step approval arrives, the balance formula will need to be reconsidered.

### Future multi-step approval migration

`allApprovalsRequired` and `approvalOrderStrict` are stored and validated but have no effect at runtime. When multi-step approval is implemented, the single `TimeOffRequestApproveService` will need to be replaced with a step-tracking model (likely a new `time_off_request_approval_steps` table). The current approval endpoint will either become a "process next step" action or be split into step-specific endpoints.

### Overlap detection is service-level only

There is no database exclusion constraint preventing two overlapping requests for the same user+policy. The check in `TimeOffRequestCreateService` is a best-effort guard that is not race-condition-safe under concurrent submissions. For MVP this is acceptable. For production, a database-level constraint or pessimistic lock would be needed.

### Single-year request restriction

This is an explicit product decision: requests crossing year boundaries are rejected. Employees who need leave spanning a year boundary (e.g. December 28 – January 3) must submit two separate requests. This should be documented in the UI.

### MANAGER approver type mismatch

The system allows configuring `MANAGER` approvers and saves them correctly, but they have no runtime effect. Any admin who looks at approval settings and sees a `MANAGER` approver configured will expect that the employee's manager receives the request — but this will not happen. The UI should indicate clearly that `MANAGER` approver resolution is coming in a future release, or the field should be hidden until implemented.

### Public Holidays are a separate module

The Public Holiday module (`V10`, separate controllers and entities) is intentionally decoupled from Time Off. The only future integration point is `requestedAmount` calculation: eventually, public holidays that fall within a request's date range should be excluded from the count. This requires passing the company's active public holiday calendar to the request calculation logic. No code changes are needed now, but the integration point should be designed before working-day counting is implemented.

### Custom policies only — no defaults

Every company starts with zero Time Off policies. There is no seeding, template library, or default "Annual Leave" policy. Onboarding a company requires an admin to manually create and configure all policies before any employee can use the system.

---

# 14. Final Summary

| Dimension | Assessment |
|-----------|-----------|
| **Backend completion** | ~80% complete for a usable MVP. Core flows (policy → assignment → balance → request → approve/reject) are fully implemented. Three endpoints are missing that block specific frontend screens (approval inbox list, `allowNegativeBalance` in DTO, user assignments list). |
| **Frontend readiness** | ~75% of screens can be built right now without backend changes. The policy, assignment, balance, and employee request screens are fully backed. The approval inbox screen is blocked by one missing endpoint. |
| **Recommended next action** | Add the three P0 missing items (approval inbox list endpoint, `allowNegativeBalance` in `TimeOffPolicyDTO`, user assignments endpoint) — these are small, probably 1–2 hours of backend work. Then switch to frontend. |
| **Switch to frontend now?** | Yes, with one caveat: start frontend with screens 1–5 (policies, settings, assignments, balances, employee request form) while the three P0 backend gaps are closed in parallel. Do not start the approval inbox screen until the list endpoint exists. |
