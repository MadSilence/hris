import type { FieldDTO } from "@/models/user/fields";
import { AttributeType } from "@/models/attribute";
import type { ResourceCode } from "@/models/access";
import type { BulkOperation } from "@/models/bulkEdit";

export type EditFieldKind = "status" | "association" | "role" | "attr" | "systemScalar";
export type EditValueSource = "status" | "departments" | "offices" | "legalEntities" | "jobs" | "roles" | "attribute";

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

const ASSOCIATIONS: { key: string; label: string; resource: ResourceCode; source: EditValueSource }[] = [
  { key: "sys:department", label: "Department", resource: "ORG.DEPARTMENT", source: "departments" },
  { key: "sys:office", label: "Office", resource: "ORG.OFFICE", source: "offices" },
  { key: "sys:legal_entity", label: "Legal entity", resource: "ORG.LEGAL_ENTITY", source: "legalEntities" },
  { key: "sys:job", label: "Job", resource: "JOBS.TITLE", source: "jobs" },
];

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
      options: [
        { id: "FULL_TIME", label: "Full-time" },
        { id: "PART_TIME", label: "Part-time" },
        { id: "CONTRACTOR", label: "Contractor" },
        { id: "INTERN", label: "Intern" },
        { id: "TEMPORARY", label: "Temporary" },
      ],
    });
  }

  for (const a of ASSOCIATIONS) {
    if (canEdit(a.resource)) {
      out.push({ key: a.key, label: a.label, kind: "association", operations: ["SET"], valueSource: a.source });
    }
  }

  if (canManage("PEOPLE.PROFILE")) {
    out.push({ key: "sys:role", label: "Role", kind: "role", operations: ["ADD", "REMOVE"], valueSource: "roles" });
  }

  for (const f of fields ?? []) {
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
