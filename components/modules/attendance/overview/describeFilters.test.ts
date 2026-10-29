import { describeFilter } from "./describeFilters";
import type { FieldDTO } from "@/models/user/fields";
import { AttributeType } from "@/models/attribute";

const office = {
  id: "sys:office",
  key: "office",
  label: "Office",
  type: AttributeType.REFERENCE,
  isSystem: true,
  level: "READ",
  valueSource: "offices",
} as FieldDTO;

const names = new Map([
  ["o1", "Berlin"],
  ["o2", "Munich"],
]);

describe("describeFilter — a reference field", () => {
  // Found by the 2026-10-16 walk (HISTORY.md § "Attendance"): the preview said "2 selected" where it could say which.
  it("names the picked values once their catalogue is read", () => {
    expect(describeFilter({ field: "sys:office", op: "in", values: ["o1", "o2"] }, [office], names)).toBe(
      "Office is any of Berlin, Munich",
    );
    expect(describeFilter({ field: "sys:office", op: "eq", value: "o1" }, [office], names)).toBe("Office is Berlin");
  });

  it("counts them while the catalogue is not read yet, rather than printing ids", () => {
    expect(describeFilter({ field: "sys:office", op: "in", values: ["o1", "o2"] }, [office])).toBe(
      "Office is any of 2 selected",
    );
  });

  it("counts them when one of the ids is not in the catalogue, rather than naming half", () => {
    expect(describeFilter({ field: "sys:office", op: "in", values: ["o1", "gone"] }, [office], names)).toBe(
      "Office is any of 2 selected",
    );
  });
});
