import { translatorFor } from "@/test/nextIntl";

import { buildEditableFields } from "./bulkEditFields";
import type { FieldDTO } from "@/models/user/fields";
import { AttributeType } from "@/models/attribute";
import type { ResourceCode } from "@/models/access";

const policyField = (level: FieldDTO["level"]): FieldDTO => ({
  id: "sys:policy",
  key: "policy_id",
  label: "Time off policies",
  type: AttributeType.REFERENCE,
  isSystem: true,
  level,
  viewScopes: ["COMPANY"],
  valueSource: "policies",
  cardinality: "MANY",
});

const t = translatorFor("organization") as unknown as Parameters<typeof buildEditableFields>[3];

const rights = (...held: ResourceCode[]) => (r: ResourceCode) => held.includes(r);

describe("buildEditableFields — sys:policy", () => {
  it("offers Add and Remove of a policy to a reader with the field's EDIT and the policies right", () => {
    const out = buildEditableFields([policyField("EDIT")], rights("PEOPLE.TIME_OFF_POLICIES"), rights(), t);

    expect(out.find((f) => f.key === "sys:policy")).toEqual(
      expect.objectContaining({ kind: "association", operations: ["ADD", "REMOVE"], valueSource: "policies" }),
    );
  });

  it("does not offer it without the field's own EDIT grant — who holds a policy is sensitive", () => {
    const out = buildEditableFields([policyField("READ")], rights("PEOPLE.TIME_OFF_POLICIES"), rights(), t);

    expect(out.some((f) => f.key === "sys:policy")).toBe(false);
  });

  it("does not offer it without the right to manage policies", () => {
    const out = buildEditableFields([policyField("EDIT")], rights("PEOPLE.PROFILE"), rights(), t);

    expect(out.some((f) => f.key === "sys:policy")).toBe(false);
  });
});
