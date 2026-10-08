import {
  CALENDAR_GROUPINGS,
  availableGroupings,
  groupKey,
  groupTitle,
  groupingLabel,
  parseCalendarGrouping,
  placeholderRowCount,
} from "@/components/modules/calendar/lib/grouping";
import type { FieldDTO } from "@/models/user/fields";
import { partialMock } from "@/test/types";

const field = (id: string, viewScopes: string[] | null): FieldDTO =>
  partialMock<FieldDTO>({ id, key: id, label: id, isSystem: true, level: "READ", viewScopes });

describe("parseCalendarGrouping", () => {
  it("reads each known dimension", () => {
    for (const g of CALENDAR_GROUPINGS) expect(parseCalendarGrouping(g)).toBe(g);
  });

  it("reads a view saved before grouping existed as flat", () => {
    expect(parseCalendarGrouping(undefined)).toBeNull();
    expect(parseCalendarGrouping(null)).toBeNull();
  });

  it("reads anything it does not know as flat rather than trusting stored JSON", () => {
    expect(parseCalendarGrouping("department")).toBeNull();
    expect(parseCalendarGrouping("LEGAL_ENTITY")).toBeNull();
    expect(parseCalendarGrouping(42)).toBeNull();
  });
});

describe("availableGroupings", () => {
  it("offers nothing until the field catalogue has loaded", () => {
    expect(availableGroupings(undefined)).toEqual([]);
  });

  it("offers a dimension only with a company-wide read on its field", () => {
    const fields = [
      field("sys:department", ["COMPANY"]),
      field("sys:team", ["SELF", "TEAM"]),
      field("sys:office", ["COMPANY", "SELF"]),
    ];
    expect(availableGroupings(fields)).toEqual(["DEPARTMENT", "OFFICE"]);
  });

  it("does not offer a field missing from the catalogue or with no scopes", () => {
    expect(availableGroupings([field("sys:team", null)])).toEqual([]);
  });

  it("keeps the fixed order whatever order the catalogue comes in", () => {
    const fields = [
      field("sys:office", ["COMPANY"]),
      field("sys:team", ["COMPANY"]),
      field("sys:department", ["COMPANY"]),
    ];
    expect(availableGroupings(fields)).toEqual(["DEPARTMENT", "TEAM", "OFFICE"]);
  });
});

describe("groupTitle", () => {
  it("names the no-value group after the dimension", () => {
    expect(groupTitle("TEAM", { id: null, name: null, count: 3 })).toBe("No team");
    expect(groupTitle("DEPARTMENT", { id: null, name: null, count: 3 })).toBe("No department");
    expect(groupTitle("OFFICE", { id: null, name: null, count: 3 })).toBe("No office");
  });

  it("uses the unit's name otherwise", () => {
    expect(groupTitle("OFFICE", { id: "o1", name: "Berlin", count: 2 })).toBe("Berlin");
  });
});

describe("groupKey", () => {
  it("gives the no-value group a key of its own", () => {
    expect(groupKey({ id: null })).not.toBe(groupKey({ id: "x" }));
    expect(groupKey({ id: "x" })).toBe("x");
  });
});

describe("placeholderRowCount", () => {
  it("draws as many placeholders as the group has, up to five, and never none", () => {
    expect(placeholderRowCount(0)).toBe(1);
    expect(placeholderRowCount(3)).toBe(3);
    expect(placeholderRowCount(40)).toBe(5);
  });
});

describe("groupingLabel", () => {
  it("labels each dimension", () => {
    expect(CALENDAR_GROUPINGS.map(groupingLabel)).toEqual(["Department", "Team", "Office"]);
  });
});
