import type { RoleFieldAccessRowDTO } from "@/api/modules/roles/dto/RoleFieldAccessDTO";
import type { FieldDTO } from "@/models/user/fields";

// Columns of the editor: on whose records the access applies.
export const FIELD_SCOPES = ["SELF", "DIRECT_REPORTS", "COMPANY"] as const;
export type FieldScope = (typeof FIELD_SCOPES)[number];
export const FIELD_SCOPE_LABELS: Record<FieldScope, string> = {
  SELF: "Own",
  DIRECT_REPORTS: "Direct reports",
  COMPANY: "Whole company",
};

// Dropdown options in each scope column.
export const FIELD_ACTIONS = ["NONE", "VIEW", "EDIT", "MANAGE"] as const;
export type FieldActionLevel = (typeof FIELD_ACTIONS)[number];
export const FIELD_ACTION_LABELS: Record<FieldActionLevel, string> = {
  NONE: "No access",
  VIEW: "View",
  EDIT: "Edit",
  MANAGE: "Manage",
};

// Per field: the action level chosen at each scope.
export type FieldAccessCell = Record<FieldScope, FieldActionLevel>;
export const EMPTY_CELL: FieldAccessCell = { SELF: "NONE", DIRECT_REPORTS: "NONE", COMPANY: "NONE" };

export const ACTION_ORDER: Record<FieldActionLevel, number> = { NONE: 0, VIEW: 1, EDIT: 2, MANAGE: 3 };

// Whole company ⊇ everyone (incl. self and reports), so its level is a floor for the narrower
// scopes: if Whole company = View, Own/Direct reports are at least View; = Manage → at least
// Manage. The reverse doesn't hold (Own = Manage leaves Whole company free, even None).
export function enforceHierarchy(cell: FieldAccessCell): FieldAccessCell {
  const floor = ACTION_ORDER[cell.COMPANY];
  const bump = (level: FieldActionLevel): FieldActionLevel =>
    ACTION_ORDER[level] < floor ? cell.COMPANY : level;
  return {
    COMPANY: cell.COMPANY,
    DIRECT_REPORTS: bump(cell.DIRECT_REPORTS),
    SELF: bump(cell.SELF),
  };
}

// Keyed by field id ("sys:first_name", "attr:<uuid>").
export type FieldAccessDraft = Record<string, FieldAccessCell>;

const emptyCell = (): FieldAccessCell => ({ SELF: "NONE", DIRECT_REPORTS: "NONE", COMPANY: "NONE" });

export function draftFromRows(rows: RoleFieldAccessRowDTO[] | undefined): FieldAccessDraft {
  const draft: FieldAccessDraft = {};
  for (const row of rows ?? []) {
    const cell = emptyCell();
    for (const s of row.viewScopes ?? []) if (s in cell) cell[s as FieldScope] = "VIEW";
    for (const s of row.editScopes ?? []) if (s in cell) cell[s as FieldScope] = "EDIT";
    for (const s of row.manageScopes ?? []) if (s in cell) cell[s as FieldScope] = "MANAGE";
    draft[row.fieldId] = cell;
  }
  return draft;
}

// Builds the PUT body. Groups each field's scopes by the action chosen at that scope.
// Fields with no access at all are dropped; non-configurable fields are never sent.
export function buildFieldAccessPayload(
  draft: FieldAccessDraft,
  fields: FieldDTO[] | undefined,
): RoleFieldAccessRowDTO[] {
  const payload: RoleFieldAccessRowDTO[] = [];
  const seen = new Set<string>();

  for (const field of fields ?? []) {
    if (field.configurable === false) continue;
    if (seen.has(field.id)) continue;

    const cell = draft[field.id] ?? EMPTY_CELL;
    const viewScopes: string[] = [];
    const editScopes: string[] = [];
    const manageScopes: string[] = [];
    for (const scope of FIELD_SCOPES) {
      switch (cell[scope]) {
        case "VIEW": viewScopes.push(scope); break;
        case "EDIT": editScopes.push(scope); break;
        case "MANAGE": manageScopes.push(scope); break;
      }
    }
    if (!viewScopes.length && !editScopes.length && !manageScopes.length) continue;

    seen.add(field.id);
    payload.push({ fieldId: field.id, viewScopes, editScopes, manageScopes });
  }

  return payload;
}

// One entry per changed (field, scope).
export type FieldAccessChange = {
  key: string;
  fieldId: string;
  fieldLabel: string;
  scope: FieldScope;
  from: FieldActionLevel;
  to: FieldActionLevel;
};

export function diffFieldAccess(
  before: FieldAccessDraft,
  after: FieldAccessDraft,
  fields: FieldDTO[] | undefined,
): FieldAccessChange[] {
  const changes: FieldAccessChange[] = [];

  for (const field of fields ?? []) {
    if (field.configurable === false) continue;

    const b = before[field.id] ?? EMPTY_CELL;
    const a = after[field.id] ?? EMPTY_CELL;
    const label = field.label ?? field.key;

    for (const scope of FIELD_SCOPES) {
      if (b[scope] !== a[scope]) {
        changes.push({
          key: `${field.id}:${scope}`,
          fieldId: field.id,
          fieldLabel: label,
          scope,
          from: b[scope],
          to: a[scope],
        });
      }
    }
  }

  return changes;
}
