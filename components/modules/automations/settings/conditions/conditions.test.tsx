import * as React from "react";
import { fireEvent, render, screen } from "@testing-library/react";

import type { Segment } from "@/models/segment/Segment";
import type { EventCondition } from "@/models/automations";
import { ConditionBuilder } from "./ConditionBuilder";
import { blankRow, rowComplete, segmentFromRows, rowsFromSegment, type ConditionRow } from "./segmentRows";
import { fromTree, toTree, blankGroup, comparisons, type EventLeaf } from "./eventConditionModel";

jest.mock("@/components/modules/automations/settings/conditions/chrome", () => jest.requireActual("@/test/automationPickersMock"));
jest.mock("@/components/modules/organization/hooks/useUserFields", () => jest.requireActual("@/test/automationSettingsMocks").userFields);
jest.mock("@/components/auth/useAccess", () => jest.requireActual("@/test/automationSettingsMocks").access);
jest.mock("@/components/audience/hooks/useAudienceFieldOptions", () => jest.requireActual("@/test/automationSettingsMocks").audienceFieldOptions);
jest.mock("@/components/hooks/useUser/useUser", () => jest.requireActual("@/test/automationSettingsMocks").user);
jest.mock("@/components/modules/settings/shared/UserPickerField/UserPickerField", () => jest.requireActual("@/test/automationSettingsMocks").userPicker);

const row = (patch: Partial<ConditionRow>): ConditionRow => ({ ...blankRow(), ...patch });

describe("segment rows", () => {
  it("a row is a filter only once it is complete, by its operator's shape", () => {
    expect(rowComplete(row({ key: "sys:office", op: "eq" }))).toBe(false);
    expect(rowComplete(row({ key: "sys:office", op: "eq", value: "o-vil" }))).toBe(true);
    expect(rowComplete(row({ key: "sys:office", op: "in", values: [] }))).toBe(false);
    expect(rowComplete(row({ key: "sys:hire_date", op: "between", value: "2026-01-01" }))).toBe(false);
  });

  it("writes the Segment DSL: flat filters, values for a list, includeEmpty only on an exclusion", () => {
    const segment = segmentFromRows(
      [
        row({ key: "sys:office", op: "in", values: ["o-vil", "o-war"] }),
        row({ key: "sys:office", op: "neq", value: "o-war" }),
        row({ key: "sys:hire_date", op: "between", value: "2026-01-01", valueTo: "2026-06-30" }),
        row({ key: "sys:hire_date", op: "eq" }),
      ],
      { filters: [], excludeUserIds: ["u-1"], includeInactive: true },
    );
    expect(segment).toEqual({
      filters: [
        { field: "sys:office", op: "in", values: ["o-vil", "o-war"] },
        { field: "sys:office", op: "neq", value: "o-war", includeEmpty: false },
        { field: "sys:hire_date", op: "between", value: "2026-01-01", valueTo: "2026-06-30" },
      ],
      excludeUserIds: ["u-1"],
      includeInactive: true,
    });
  });

  it("no condition is null, and reads back what it wrote", () => {
    expect(segmentFromRows([row({})], null)).toBeNull();
    const segment: Segment = { filters: [{ field: "sys:office", op: "eq", value: "o-vil" }], excludeUserIds: [] };
    expect(segmentFromRows(rowsFromSegment(segment), segment)).toEqual(segment);
  });
});

describe("event condition tree", () => {
  it("writes ALL / ANY with MATCH leaves, and nothing for no complete condition", () => {
    const leaf = (field: string, op: EventLeaf["op"], value: string): EventLeaf => ({ kind: "leaf", id: Math.random(), field, op, value });
    const root = blankGroup("AND", [leaf("days", "gt", "10"), blankGroup("OR", [leaf("leaveType", "eq", "Vacation"), leaf("days", "lt", "")])]);
    expect(toTree(root)).toEqual({
      kind: "ALL",
      children: [
        { kind: "MATCH", field: "days", op: "gt", value: "10" },
        { kind: "ANY", children: [{ kind: "MATCH", field: "leaveType", op: "eq", value: "Vacation" }] },
      ],
    });
    expect(toTree(blankGroup("AND", [leaf("days", "gt", "")]))).toBeNull();
  });

  it("reads a stored tree back, a NOT over one comparison as its opposite", () => {
    const tree: EventCondition = {
      kind: "ANY",
      children: [
        { kind: "NOT", children: [{ kind: "MATCH", field: "days", op: "gt", value: "5" }] },
        { kind: "MATCH", field: "leaveType", op: "eq", value: "Sick" },
      ],
    };
    const root = fromTree(tree);
    expect(root.joiner).toBe("OR");
    expect(toTree(root)).toEqual({
      kind: "ANY",
      children: [
        { kind: "MATCH", field: "days", op: "lte", value: "5" },
        { kind: "MATCH", field: "leaveType", op: "eq", value: "Sick" },
      ],
    });
    expect(comparisons(tree).map((l) => `${l.field} ${l.op} ${l.value}`)).toEqual(["days lte 5", "leaveType eq Sick"]);
  });
});

describe("ConditionBuilder", () => {
  const Harness: React.FC<{ initial: Segment | null; onChange: (s: Segment | null) => void; autoOpen?: boolean }> = ({ initial, onChange, autoOpen }) => {
    const [value, setValue] = React.useState(initial);
    return (
      <ConditionBuilder
        value={value}
        autoOpen={autoOpen}
        onChange={(next) => {
          setValue(next);
          onChange(next);
        }}
      />
    );
  };

  it("a picked field and value make a valid Segment; the operator and value wait for the field", () => {
    const onChange = jest.fn();
    render(<Harness initial={null} onChange={onChange} autoOpen />);
    expect(screen.getByLabelText("Comparison")).toBeDisabled();
    expect(screen.getByLabelText("Value")).toBeDisabled();
    fireEvent.change(screen.getByLabelText("Field"), { target: { value: "sys:office" } });
    expect(screen.getByLabelText("Comparison")).not.toBeDisabled();
    fireEvent.change(screen.getByLabelText("Value"), { target: { value: "o-war" } });
    expect(onChange).toHaveBeenLastCalledWith({ filters: [{ field: "sys:office", op: "eq", value: "o-war" }], excludeUserIds: [] });
    fireEvent.change(screen.getByLabelText("Comparison"), { target: { value: "in" } });
    const values = screen.getByLabelText("Value") as HTMLSelectElement;
    Array.from(values.options).forEach((o) => (o.selected = true));
    fireEvent.change(values);
    expect(onChange).toHaveBeenLastCalledWith({ filters: [{ field: "sys:office", op: "in", values: ["o-vil", "o-war"] }], excludeUserIds: [] });
  });

  it("joins conditions with “and”: the DSL has no OR between filters and no groups", () => {
    render(
      <Harness
        initial={{
          filters: [
            { field: "sys:office", op: "eq", value: "o-vil" },
            { field: "sys:hire_date", op: "after", value: "2026-01-01" },
          ],
          excludeUserIds: [],
        }}
        onChange={jest.fn()}
      />,
    );
    expect(screen.getByText("and")).toBeInTheDocument();
    expect(screen.queryByRole("radio", { name: "Or" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Add a group" })).not.toBeInTheDocument();
  });

  it("removing the last condition leaves no condition", () => {
    const onChange = jest.fn();
    render(<Harness initial={{ filters: [{ field: "sys:office", op: "eq", value: "o-vil" }], excludeUserIds: [] }} onChange={onChange} />);
    fireEvent.click(screen.getByRole("button", { name: "Remove the condition" }));
    expect(onChange).toHaveBeenLastCalledWith(null);
  });

  it("read mode: the conditions in words and the count", () => {
    render(
      <ConditionBuilder
        readOnly
        value={{ filters: [{ field: "sys:office", op: "in", values: ["o-vil", "o-war"] }], excludeUserIds: [] }}
        onChange={jest.fn()}
        count={{ matching: 48, people: [{ id: "u1", name: "Lena Kowalska" }] }}
      />,
    );
    expect(screen.getByText("Vilnius or Warsaw")).toBeInTheDocument();
    expect(screen.getByText(/^48.people match$/).textContent).toBe("48\u00a0people match");
    expect(screen.getByRole("button", { name: "See who" })).toBeInTheDocument();
  });
});
