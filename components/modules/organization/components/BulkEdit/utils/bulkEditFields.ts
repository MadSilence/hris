import { isReferenceField, type FieldDTO, type ReferenceValueSource } from "@/models/user/fields";
import { AttributeType } from "@/models/attribute";
import type { ResourceCode } from "@/models/access";
import type { BulkOperation } from "@/models/bulkEdit";
import { EMPLOYMENT_TYPES } from "@/models/user/employmentType";

export type EditFieldKind = "status" | "association" | "role" | "attr" | "systemScalar";
export type EditValueSource = "status" | "attribute" | ReferenceValueSource;

export type EditOption = { id: string; label: string };

export type EditField = {
  key: string;
  label: string;
  kind: EditFieldKind;
  operations: BulkOperation[];
  valueSource: EditValueSource;
  attrType?: AttributeType;
  options?: EditOption[];
};

/**
 * Reference catalogues that bulk edit can actually write — `BulkEditService.ASSIGNABLE` knows
 * department, office, legal entity and job. Team, calendar, manager and role are references too,
 * but there is no bulk write path for them, so they are not offered here.
 * The labels come from the field catalogue; only this permission mapping stays local.
 */
const BULK_ASSIGNABLE_SOURCES: Partial<Record<ReferenceValueSource, ResourceCode>> = {
  departments: "ORG.DEPARTMENT",
  offices: "ORG.OFFICE",
  legalEntities: "ORG.LEGAL_ENTITY",
  jobs: "JOBS.TITLE",
};

export function buildEditableFields(
  fields: FieldDTO[] | undefined,
  canEdit: (resource: ResourceCode) => boolean,
  canManage: (resource: ResourceCode) => boolean,
): EditField[] {
  const out: EditField[] = [];

  if (canEdit("PEOPLE.PROFILE")) {
    out.push({ key: "sys:status", label: "Status", kind: "status", operations: ["SET"], valueSource: "status" });

    // Scalar employment/lifecycle system fields (rendered by attrType in the modal's ValueEditor).
    const dateOps: BulkOperation[] = ["SET", "CLEAR"];
    out.push({ key: "sys:hire_date", label: "Hire date", kind: "systemScalar", operations: dateOps, valueSource: "attribute", attrType: AttributeType.DATE });
    out.push({ key: "sys:probation_end", label: "Probation end", kind: "systemScalar", operations: dateOps, valueSource: "attribute", attrType: AttributeType.DATE });
    out.push({ key: "sys:termination_date", label: "Termination date", kind: "systemScalar", operations: dateOps, valueSource: "attribute", attrType: AttributeType.DATE });
    out.push({
      key: "sys:employment_type",
      label: "Employment type",
      kind: "systemScalar",
      operations: dateOps,
      valueSource: "attribute",
      attrType: AttributeType.SELECT,
      options: EMPLOYMENT_TYPES.map((t) => ({ id: t.id, label: t.label })),
    });
  }

  for (const f of fields ?? []) {
    if (!isReferenceField(f)) continue;

    const source = f.valueSource as ReferenceValueSource;
    const resource = BULK_ASSIGNABLE_SOURCES[source];
    if (!resource || !canEdit(resource)) continue;

    out.push({
      key: f.id,
      label: f.label ?? f.key,
      kind: "association",
      operations: ["SET"],
      valueSource: source,
    });
  }

  if (canManage("PEOPLE.PROFILE")) {
    out.push({ key: "sys:role", label: "Role", kind: "role", operations: ["ADD", "REMOVE"], valueSource: "roles" });
  }

  for (const f of fields ?? []) {
    // System fields are handled above; references included.
    if (f.isSystem || f.level !== "EDIT" || f.type === "PERSON") continue;
    if (!(f.viewScopes ?? []).includes("COMPANY")) continue;
    out.push({
      key: f.id,
      label: f.label ?? f.key,
      kind: "attr",
      operations: ["SET", "CLEAR"],
      valueSource: "attribute",
      attrType: f.type,
      options: (f.options ?? []).map((o) => ({ id: o.id, label: o.value })),
    });
  }

  return out;
}
