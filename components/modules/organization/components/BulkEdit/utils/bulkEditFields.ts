import { isReferenceField, type FieldDTO, type ReferenceValueSource } from "@/models/user/fields";
import { AttributeType } from "@/models/attribute";
import type { ResourceCode } from "@/models/access";
import type { BulkOperation } from "@/models/bulkEdit";
import { EMPLOYMENT_TYPES } from "@/models/user/employmentType";
import type { useTranslations } from "next-intl";

type OrganizationT = ReturnType<typeof useTranslations<"organization">>;

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
  t: OrganizationT,
): EditField[] {
  const out: EditField[] = [];

  if (canEdit("PEOPLE.PROFILE")) {
    out.push({ key: "sys:status", label: t("bulkEdit.fields.status"), kind: "status", operations: ["SET"], valueSource: "status" });

    // Scalar employment/lifecycle system fields (rendered by attrType in the modal's ValueEditor).
    const dateOps: BulkOperation[] = ["SET", "CLEAR"];
    out.push({ key: "sys:hire_date", label: t("bulkEdit.fields.hireDate"), kind: "systemScalar", operations: dateOps, valueSource: "attribute", attrType: AttributeType.DATE });
    out.push({ key: "sys:probation_end", label: t("bulkEdit.fields.probationEnd"), kind: "systemScalar", operations: dateOps, valueSource: "attribute", attrType: AttributeType.DATE });
    out.push({ key: "sys:termination_date", label: t("bulkEdit.fields.terminationDate"), kind: "systemScalar", operations: dateOps, valueSource: "attribute", attrType: AttributeType.DATE });
    out.push({
      key: "sys:employment_type",
      label: t("bulkEdit.fields.employmentType"),
      kind: "systemScalar",
      operations: dateOps,
      valueSource: "attribute",
      attrType: AttributeType.SELECT,
      options: EMPLOYMENT_TYPES.map((type) => ({ id: type.id, label: t(type.labelKey) })),
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
    out.push({ key: "sys:role", label: t("bulkEdit.fields.role"), kind: "role", operations: ["ADD", "REMOVE"], valueSource: "roles" });
  }

  // A time off policy is held, not set: Add starts it today, Remove ends it today. Sensitive, so the
  // field's own EDIT grant is asked for as well as the right to manage policies — the server asks both.
  const policy = fields?.find((f) => f.id === "sys:policy");
  if (policy && policy.level === "EDIT" && canEdit("PEOPLE.TIME_OFF_POLICIES")) {
    out.push({
      key: "sys:policy",
      label: policy.label ?? t("bulkEdit.fields.timeOffPolicies"),
      kind: "association",
      operations: ["ADD", "REMOVE"],
      valueSource: "policies",
    });
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
