import { reorderChecked, toggleColumn } from "./columnOrder";
import type { ColumnItem } from "@/models/userTable";

const col = (id: string, checked: boolean): ColumnItem => ({ id, label: id, checked });

const ids = (columns: ColumnItem[]) => columns.map((c) => c.id);
const shown = (columns: ColumnItem[]) => columns.filter((c) => c.checked).map((c) => c.id);

const PINNED = "sys:first_name";

describe("toggleColumn", () => {
  const columns = [
    col(PINNED, true),
    col("sys:email", true),
    col("sys:status", false),
    col("attr:mentor", false),
  ];

  it("puts a newly shown column at the end of the shown block", () => {
    // It becomes the rightmost column, and nothing already on screen moves.
    const next = toggleColumn(columns, "attr:mentor", true, PINNED);

    expect(ids(next)).toEqual([PINNED, "sys:email", "attr:mentor", "sys:status"]);
    expect(shown(next)).toEqual([PINNED, "sys:email", "attr:mentor"]);
  });

  it("drops a hidden column to the top of the rest", () => {
    const next = toggleColumn(columns, "sys:email", false, PINNED);

    expect(ids(next)).toEqual([PINNED, "sys:email", "sys:status", "attr:mentor"]);
    expect(shown(next)).toEqual([PINNED]);
  });

  it("refuses to touch the pinned column", () => {
    expect(toggleColumn(columns, PINNED, false, PINNED)).toBe(columns);
  });

  it("is a no-op when the state already matches", () => {
    expect(toggleColumn(columns, "sys:email", true, PINNED)).toBe(columns);
  });
});

describe("reorderChecked", () => {
  const columns = [
    col(PINNED, true),
    col("sys:email", true),
    col("sys:status", true),
    col("attr:mentor", false),
  ];

  it("reorders the shown block and leaves the rest alone", () => {
    const next = reorderChecked(columns, ["sys:status", "sys:email"], PINNED);

    expect(ids(next)).toEqual([PINNED, "sys:status", "sys:email", "attr:mentor"]);
  });

  it("keeps the pinned column first even if a drop claims otherwise", () => {
    const next = reorderChecked(columns, ["sys:email", PINNED, "sys:status"], PINNED);

    expect(ids(next)[0]).toBe(PINNED);
    expect(ids(next)).toEqual([PINNED, "sys:email", "sys:status", "attr:mentor"]);
  });

  it("does not lose a shown column the drop did not mention", () => {
    const next = reorderChecked(columns, ["sys:status"], PINNED);

    expect(ids(next)).toEqual([PINNED, "sys:status", "sys:email", "attr:mentor"]);
  });

  it("ignores ids that are not shown columns", () => {
    const next = reorderChecked(columns, ["attr:mentor", "sys:status"], PINNED);

    expect(ids(next)).toEqual([PINNED, "sys:status", "sys:email", "attr:mentor"]);
  });
});
