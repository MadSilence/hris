import {
  buildAudienceFields,
  isNegativeOperator,
  operatorsForField,
} from "./fieldCatalog";
import type { FieldDTO } from "@/models/user/fields";
import { AttributeType } from "@/models/attribute";

const field = (over: Partial<FieldDTO>): FieldDTO => ({
  id: "attr:1",
  key: "custom",
  label: "Custom",
  type: AttributeType.TEXT,
  isSystem: false,
  level: "READ",
  viewScopes: ["COMPANY"],
  ...over,
});

/** A system REFERENCE field as the backend registry now describes it. */
const reference = (over: Partial<FieldDTO>): FieldDTO =>
  field({
    isSystem: true,
    type: AttributeType.REFERENCE,
    cardinality: "ONE",
    group: "Organisation",
    ...over,
  });

describe("operatorsForField", () => {
  it("gives custom NUMBER attributes numeric comparison + range operators", () => {
    expect(operatorsForField(field({ type: AttributeType.NUMBER }))).toEqual([
      "eq",
      "neq",
      "gt",
      "gte",
      "lt",
      "lte",
      "between",
    ]);
  });

  it("gives custom DATE attributes eq + range operators", () => {
    expect(operatorsForField(field({ type: AttributeType.DATE }))).toEqual([
      "eq",
      "neq",
      "before",
      "after",
      "between",
    ]);
  });

  it("keeps text custom attributes on equality/text operators", () => {
    expect(operatorsForField(field({ type: AttributeType.TEXT }))).toEqual([
      "eq",
      "neq",
      "contains",
      "starts_with",
      "in",
      "not_in",
    ]);
  });

  it("lets multi-select custom attributes be matched or excluded by set", () => {
    expect(operatorsForField(field({ type: AttributeType.MULTI_SELECT })))
      .toEqual(["has_any", "not_has_any"]);
  });

  it("gives system date fields eq + range operators", () => {
    expect(operatorsForField(field({ isSystem: true, type: AttributeType.DATE }))).toEqual([
      "eq",
      "neq",
      "before",
      "after",
      "between",
    ]);
  });

  it("gives single-valued references id-matching operators", () => {
    expect(
      operatorsForField(reference({ id: "sys:office", valueSource: "offices" })),
    ).toEqual(["eq", "neq", "in", "not_in"]);
  });

  it("gives multi-valued references set operators", () => {
    expect(
      operatorsForField(
        reference({ id: "sys:team", valueSource: "teams", cardinality: "MANY" }),
      ),
    ).toEqual(["eq", "in", "has_any", "not_has_any"]);
  });

  it("keeps manager on single-value operators — there is no multi people-picker", () => {
    expect(
      operatorsForField(reference({ id: "sys:manager", valueSource: "people" })),
    ).toEqual(["eq", "neq"]);
  });

  // The engine resolved these long before the builder offered them; the catalogue is the thing
  // that was behind, so pin the parity rather than the individual lists.
  it("offers a negation for every field kind that has one server-side", () => {
    expect(operatorsForField(field({ type: AttributeType.SELECT }))).toContain("not_in");
    expect(operatorsForField(field({ isSystem: true, type: AttributeType.SELECT })))
      .toContain("not_in");

    const references: FieldDTO[] = [
      reference({ id: "sys:department", valueSource: "departments" }),
      reference({ id: "sys:team", valueSource: "teams", cardinality: "MANY" }),
      reference({ id: "sys:calendar", valueSource: "calendars", cardinality: "MANY" }),
      reference({ id: "sys:office", valueSource: "offices" }),
      reference({ id: "sys:legal_entity", valueSource: "legalEntities" }),
      reference({ id: "sys:job", valueSource: "jobs" }),
    ];

    for (const ref of references) {
      expect(
        operatorsForField(ref).some(
          (op) => op === "neq" || op === "not_in" || op === "not_has_any",
        ),
      ).toBe(true);
    }
  });
});

describe("isNegativeOperator", () => {
  it("marks exactly the operators that exclude", () => {
    expect(isNegativeOperator("neq")).toBe(true);
    expect(isNegativeOperator("not_in")).toBe(true);
    expect(isNegativeOperator("not_has_any")).toBe(true);

    // Only these get the "include people with no value" choice in the UI.
    expect(isNegativeOperator("eq")).toBe(false);
    expect(isNegativeOperator("in")).toBe(false);
    expect(isNegativeOperator("has_any")).toBe(false);
    expect(isNegativeOperator("between")).toBe(false);
  });
});

describe("buildAudienceFields", () => {
  // There is no hardcoded org list any more: everything comes from /users/fields.
  it("builds every field from the server catalogue", () => {
    const result = buildAudienceFields([
      reference({ id: "sys:office", label: "Office", valueSource: "offices" }),
      field({ id: "attr:visible", label: "Visible" }),
    ]);

    expect(result.map((f) => f.key)).toEqual(["sys:office", "attr:visible"]);
  });

  it("returns nothing when the catalogue is empty", () => {
    expect(buildAudienceFields([])).toEqual([]);
  });

  it("marks references as Org and points them at their catalogue", () => {
    const [office] = buildAudienceFields([
      reference({ id: "sys:office", label: "Office", valueSource: "offices" }),
    ]);

    expect(office.group).toBe("Org");
    expect(office.valueSource).toBe("offices");
  });

  it("drops custom attributes the caller cannot view at company scope", () => {
    const result = buildAudienceFields([
      field({ id: "attr:selfonly", label: "Self only", viewScopes: ["SELF"] }),
      field({ id: "attr:hidden", label: "Hidden", viewScopes: [] }),
      field({ id: "attr:visible", label: "Visible", viewScopes: ["COMPANY"] }),
    ]);

    const keys = result.map((f) => f.key);
    expect(keys).toContain("attr:visible");
    expect(keys).not.toContain("attr:hidden");
    // SELF-only fields aren't filterable (filtering is company-wide).
    expect(keys).not.toContain("attr:selfonly");
  });

  it("keeps system fields regardless of the caller's own level", () => {
    const result = buildAudienceFields([
      field({ id: "sys:first_name", key: "first_name", label: "First name", isSystem: true, level: "NONE" }),
    ]);

    expect(result.map((f) => f.key)).toContain("sys:first_name");
  });

  it("drops a reference when the caller cannot read its catalogue", () => {
    const fields = [
      reference({ id: "sys:office", label: "Office", valueSource: "offices" }),
      reference({ id: "sys:job", label: "Job", valueSource: "jobs" }),
    ];

    const keys = buildAudienceFields(fields, (resource) => resource !== "JOBS.TITLE")
      .map((f) => f.key);

    expect(keys).toContain("sys:office");
    expect(keys).not.toContain("sys:job");
  });
});
