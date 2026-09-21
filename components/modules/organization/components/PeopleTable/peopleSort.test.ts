import { isSortKeyAvailable, sortKeyForColumn } from "./peopleSort";
import { applyPayload } from "@/components/modules/organization/components/PeopleViews/utils/viewPayload";
import type { FieldDTO } from "@/models/user/fields";
import { AttributeType } from "@/models/attribute";

const ATTR = "attr:22222222-2222-2222-2222-222222222222";

const field = (over: Partial<FieldDTO>): FieldDTO => ({
  id: ATTR,
  key: "Salary band",
  label: "Salary band",
  type: AttributeType.NUMBER,
  isSystem: false,
  level: "READ",
  viewScopes: ["COMPANY"],
  ...over,
});

describe("sortKeyForColumn", () => {
  it("sends a system column by its bare key", () => {
    expect(sortKeyForColumn("sys:hire_date")).toBe("hire_date");
  });

  it("leaves a reference column inert", () => {
    expect(sortKeyForColumn("sys:department")).toBeNull();
  });

  it.each([
    AttributeType.TEXT,
    AttributeType.NUMBER,
    AttributeType.DATE,
    AttributeType.SELECT,
    AttributeType.CHECKBOX,
    AttributeType.COUNTRY,
  ])("sorts a %s attribute by its full column id", (type) => {
    expect(sortKeyForColumn(ATTR, { type, isSystem: false })).toBe(ATTR);
  });

  it.each([
    AttributeType.MULTI_SELECT,
    AttributeType.PERSON,
    AttributeType.LONG_TEXT,
    AttributeType.MONEY,
    AttributeType.ADDRESS,
    AttributeType.OBJECT,
  ])("does not sort a %s attribute — it has no single value to order by", (type) => {
    expect(sortKeyForColumn(ATTR, { type, isSystem: false })).toBeNull();
  });

  it("does not guess an attribute's type without its metadata", () => {
    expect(sortKeyForColumn(ATTR)).toBeNull();
  });
});

describe("a saved sort", () => {
  it("keeps an attribute sort for a reader who sees the column", () => {
    expect(isSortKeyAvailable(ATTR, [field({})])).toBe(true);
  });

  // The backend refuses it (SG00005): ordering by a hidden value reads it out.
  it("drops an attribute sort for a reader who does not", () => {
    expect(isSortKeyAvailable(ATTR, [])).toBe(false);
  });

  it("keeps the employment columns the views' own list used to drop", () => {
    expect(isSortKeyAvailable("hire_date", [])).toBe(true);
  });

  it("is applied from a view only where it still holds, and says when it was dropped", () => {
    const payload = { columns: [ATTR], filters: [], sort: { fieldId: ATTR, dir: "desc" as const } };

    expect(applyPayload(payload, [field({})]).sort).toEqual({ fieldId: ATTR, dir: "desc" });

    const withoutAccess = applyPayload(payload, []);
    expect(withoutAccess.sort).toBeNull();
    expect(withoutAccess.dropped).toBe(2); // the column and the sort
  });
});
