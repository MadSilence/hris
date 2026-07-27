import { buildAudienceFields, operatorsForField, ORG_AUDIENCE_FIELDS } from "./fieldCatalog";
import type { FieldDTO } from "@/models/user/fields";

const field = (over: Partial<FieldDTO>): FieldDTO => ({
  id: "attr:1",
  key: "custom",
  label: "Custom",
  type: "TEXT",
  isSystem: false,
  level: "READ",
  viewScopes: ["COMPANY"],
  ...over,
});

describe("operatorsForField", () => {
  it("gives custom NUMBER attributes numeric comparison + range operators", () => {
    expect(operatorsForField(field({ type: "NUMBER" }))).toEqual([
      "eq",
      "gt",
      "gte",
      "lt",
      "lte",
      "between",
    ]);
  });

  it("gives custom DATE attributes eq + range operators", () => {
    expect(operatorsForField(field({ type: "DATE" }))).toEqual([
      "eq",
      "before",
      "after",
      "between",
    ]);
  });

  it("keeps text custom attributes on equality/text operators", () => {
    expect(operatorsForField(field({ type: "TEXT" }))).toEqual([
      "eq",
      "neq",
      "contains",
      "starts_with",
      "in",
    ]);
  });

  it("limits multi-select custom attributes to has_any (set intersection)", () => {
    expect(operatorsForField(field({ type: "MULTI_SELECT" }))).toEqual(["has_any"]);
  });

  it("gives system date fields eq + range operators", () => {
    expect(operatorsForField(field({ isSystem: true, type: "DATE" }))).toEqual([
      "eq",
      "before",
      "after",
      "between",
    ]);
  });

  it("gives system text fields text operators", () => {
    expect(operatorsForField(field({ isSystem: true, type: "TEXT" }))).toEqual([
      "eq",
      "neq",
      "contains",
      "starts_with",
      "in",
    ]);
  });
});

describe("buildAudienceFields", () => {
  it("always includes the seven org association fields", () => {
    const result = buildAudienceFields([]);
    expect(result.map((f) => f.key)).toEqual(ORG_AUDIENCE_FIELDS.map((f) => f.key));
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

  it("keeps system fields regardless of level and never duplicates org keys", () => {
    const result = buildAudienceFields([
      field({ id: "sys:first_name", key: "first_name", label: "First name", isSystem: true, level: "NONE" }),
      field({ id: "sys:department", key: "department", isSystem: true, level: "NONE" }),
    ]);

    const keys = result.map((f) => f.key);
    expect(keys).toContain("sys:first_name");
    // sys:department is supplied by ORG_AUDIENCE_FIELDS, not duplicated from the catalogue.
    expect(keys.filter((k) => k === "sys:department")).toHaveLength(1);
  });
});
