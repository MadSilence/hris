import {
  decodeTableState,
  encodeTableState,
  hasTableState,
  urlStateToPayload,
  type TableStateDefaults,
} from "./tableUrlState";
import type { FilterDTO } from "@/models/user/fields";

const defaults: TableStateDefaults = {
  columns: ["sys:first_name", "sys:status", "sys:email"],
  sort: { fieldId: "first_name", dir: "asc" },
};

const filters: FilterDTO[] = [
  { field: "sys:department", op: "in", values: ["d-1", "d-2"] },
  { field: "attr:1234", op: "contains", value: "a,b & c?" },
];

describe("tableUrlState", () => {
  it("round-trips columns, filters, sort, search and the drafts segment", () => {
    const state = {
      columns: ["sys:first_name", "attr:1234", "sys:email"],
      filters,
      sort: { fieldId: "attr:1234", dir: "desc" as const },
      q: "  anna ",
      drafts: true,
    };

    const query = encodeTableState(state, defaults);
    const decoded = decodeTableState(new URLSearchParams(query));

    expect(decoded).toEqual({ ...state, q: "anna" });
    expect(urlStateToPayload(decoded, defaults)).toEqual({
      columns: state.columns,
      filters,
      sort: state.sort,
    });
  });

  it("writes nothing for an untouched table, so its address stays clean", () => {
    const query = encodeTableState(
      { columns: defaults.columns, filters: [], sort: defaults.sort, q: "", drafts: false },
      defaults,
    );

    expect(query).toBe("");
    expect(hasTableState(new URLSearchParams(query))).toBe(false);
  });

  it("keeps the page's other parameters and replaces its own", () => {
    const base = new URLSearchParams("tab=people&q=old&drafts=1");

    const query = encodeTableState(
      { columns: defaults.columns, filters: [], sort: defaults.sort, q: "new", drafts: false },
      defaults,
      base,
    );

    const params = new URLSearchParams(query);
    expect(params.get("tab")).toBe("people");
    expect(params.get("q")).toBe("new");
    expect(params.get("drafts")).toBeNull();
  });

  it("says when the sort was cleared, which is not the same as the default", () => {
    const query = encodeTableState(
      { columns: defaults.columns, filters: [], sort: null, q: "", drafts: false },
      defaults,
    );

    expect(decodeTableState(new URLSearchParams(query)).sort).toBeNull();
  });

  it("falls back to the default for a part that does not parse, rather than refusing the link", () => {
    const decoded = decodeTableState(new URLSearchParams("f=%7Bnot-json&sort=hire_date:sideways&cols="));

    expect(decoded.filters).toEqual([]);
    expect(decoded.sort).toBeUndefined();
    expect(decoded.columns).toBeNull();
    expect(urlStateToPayload(decoded, defaults)).toEqual({ columns: defaults.columns, filters: [], sort: defaults.sort });
  });

  it("drops a filter that is not shaped like one", () => {
    const raw = JSON.stringify([{ field: "sys:status", op: "eq", value: "ACTIVE" }, { nope: true }, "x"]);

    expect(decodeTableState(new URLSearchParams({ f: raw })).filters).toEqual([
      { field: "sys:status", op: "eq", value: "ACTIVE" },
    ]);
  });
});
