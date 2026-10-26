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
  sortable: true,
  ...over,
});

const hireDate = field({ id: "sys:hire_date", key: "hire_date", type: AttributeType.DATE, isSystem: true });

describe("sortKeyForColumn", () => {
  it("sends a system column by its bare key", () => {
    expect(sortKeyForColumn("sys:hire_date", { sortable: true })).toBe("hire_date");
  });

  it("sorts an attribute by its full column id", () => {
    expect(sortKeyForColumn(ATTR, { sortable: true })).toBe(ATTR);
  });

  // The backend's answer, whatever the type: the header keeps no list of its own.
  it("leaves a column the backend does not mark sortable inert", () => {
    expect(sortKeyForColumn("sys:department", { sortable: false })).toBeNull();
    expect(sortKeyForColumn(ATTR, { sortable: false })).toBeNull();
  });

  it("does not guess without the field's metadata", () => {
    expect(sortKeyForColumn("sys:hire_date")).toBeNull();
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

  it("keeps a system sort the field catalogue marks sortable", () => {
    expect(isSortKeyAvailable("hire_date", [hireDate])).toBe(true);
  });

  it("drops a sort the field no longer allows", () => {
    expect(isSortKeyAvailable("hire_date", [{ ...hireDate, sortable: false }])).toBe(false);
  });

  it("is applied from a view only where it still holds, and says when it was dropped", () => {
    const payload = { columns: [ATTR], filters: [], sort: { fieldId: ATTR, dir: "desc" as const } };

    expect(applyPayload(payload, [field({})]).sort).toEqual({ fieldId: ATTR, dir: "desc" });

    const withoutAccess = applyPayload(payload, []);
    expect(withoutAccess.sort).toBeNull();
    expect(withoutAccess.dropped).toBe(2); // the column and the sort
  });
});
