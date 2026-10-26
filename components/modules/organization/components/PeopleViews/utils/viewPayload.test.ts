import { applyPayload } from "./viewPayload";
import type { FieldDTO } from "@/models/user/fields";
import type { ViewPayload } from "@/models/peopleView";
import { partialMock } from "@/test/types";

const field = (id: string): FieldDTO =>
  partialMock<FieldDTO>({ id, key: id, label: id, isSystem: id.startsWith("sys:") });

describe("applyPayload", () => {
  /** Found by the walk of 2026-10-26: such a view threw in the click handler and was never applied. */
  it("treats a sort with no field id as no sort instead of throwing", () => {
    const payload = {
      columns: ["sys:first_name", "sys:email"],
      filters: [],
      sort: { field: "last_name", dir: "asc" },
    } as unknown as ViewPayload;

    const applied = applyPayload(payload, [field("sys:first_name"), field("sys:email")]);

    expect(applied.sort).toBeNull();
    expect(applied.columns.filter((c) => c.checked).map((c) => c.id)).toEqual(["sys:first_name", "sys:email"]);
  });
});
