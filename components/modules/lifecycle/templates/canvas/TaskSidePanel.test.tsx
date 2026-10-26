import * as React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { TaskSidePanel } from "./TaskSidePanel";
import type { DraftItem } from "./draft";

jest.mock("@/public/desact/src/components/ui/select", () => jest.requireActual("@/test/selectMock"));
jest.mock("@/components/modules/settings/modules/attributes/hooks/AttributeGroup/useAttributeGroups", () => ({
  useAttributeGroups: () => ({ data: [{ id: "g", attributes: [{ id: "phone", name: "Emergency phone", type: "PHONE" }, { id: "boss", name: "Mentor", type: "PERSON" }] }] }),
}));
jest.mock("@/components/modules/organization/modules/profile/modules/personalDocuments/hooks/useDocumentCategories", () => ({
  useDocumentCategories: () => ({ data: [{ id: "passport", name: "Passport" }] }),
}));
jest.mock("@/components/modules/settings/shared/UserPickerField/UserPickerField", () => ({
  UserPickerField: ({ onChange }: { onChange: (u: { id: string; firstName: string; lastName: string }) => void }) => (
    <button type="button" onClick={() => onChange({ id: "u7", firstName: "Grace", lastName: "Hopper" })}>Pick Grace</button>
  ),
}));

const item = (key: string, over: Partial<DraftItem> = {}): DraftItem => ({
  key,
  kind: "CHECKLIST",
  title: `Task ${key}`,
  description: "",
  dueKind: "OFFSET",
  offsetDays: 2,
  assigneeKind: "TARGET",
  assigneeUserId: null,
  assigneeName: null,
  assigneeProblem: null,
  attributeIds: [],
  categoryId: null,
  waitsFor: [],
  ...over,
});

const setup = (subject: DraftItem, all: DraftItem[], type: "ONBOARDING" | "PREBOARDING" = "ONBOARDING") => {
  const onChange = jest.fn();
  const onRemove = jest.fn();
  render(<TaskSidePanel item={subject} items={all} type={type} onChange={onChange} onRemove={onRemove} onClose={jest.fn()} />);
  return { onChange, onRemove };
};

describe("TaskSidePanel", () => {
  it("edits the title, the kind and the description as they are typed", () => {
    const a = item("a");
    const { onChange } = setup(a, [a]);
    fireEvent.change(screen.getByLabelText(/Title/), { target: { value: "Order a laptop" } });
    expect(onChange).toHaveBeenLastCalledWith({ title: "Order a laptop" });
    fireEvent.change(screen.getByLabelText("Kind"), { target: { value: "DOCUMENT" } });
    expect(onChange).toHaveBeenLastCalledWith({ kind: "DOCUMENT" });
    fireEvent.change(screen.getByLabelText("Description"), { target: { value: "Ask IT" } });
    expect(onChange).toHaveBeenLastCalledWith({ description: "Ask IT" });
  });

  it("offers the same timing a drag sets, in words — the non-drag path", () => {
    const a = item("a", { offsetDays: 2 });
    const { onChange } = setup(a, [a]);
    expect(screen.getByText(/2 days after start/)).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("Days"), { target: { value: "5" } });
    expect(onChange).toHaveBeenLastCalledWith({ dueKind: "OFFSET", offsetDays: 5 });
    // The days typed stay when the direction changes: five after becomes five before.
    fireEvent.change(screen.getByLabelText("When"), { target: { value: "BEFORE" } });
    expect(onChange).toHaveBeenLastCalledWith({ dueKind: "OFFSET", offsetDays: -5 });
    fireEvent.change(screen.getByLabelText("When"), { target: { value: "BEFORE_START" } });
    expect(onChange).toHaveBeenLastCalledWith({ dueKind: "BEFORE_START", offsetDays: null });
  });

  it("changes who does it — the lane — including a named person", () => {
    const a = item("a");
    const { onChange } = setup(a, [a]);
    fireEvent.change(screen.getByLabelText("Done By"), { target: { value: "ONBOARDING_MANAGER" } });
    expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({ assigneeKind: "ONBOARDING_MANAGER", assigneeUserId: null }));

    const named = item("b", { assigneeKind: "SPECIFIC_USER" });
    const second = setup(named, [named]);
    fireEvent.click(screen.getByRole("button", { name: "Pick Grace" }));
    expect(second.onChange).toHaveBeenLastCalledWith({ assigneeUserId: "u7", assigneeName: "Grace Hopper", assigneeProblem: null });
  });

  it("makes a task wait for others, and does not offer one that would close a circle", () => {
    const a = item("a");
    const b = item("b", { waitsFor: ["a"] });
    const c = item("c");
    const { onChange } = setup(a, [a, b, c]);

    const circle = screen.getByLabelText("Waits for Task b");
    expect(circle).toBeDisabled();
    expect(screen.getByText(/would make a circle/)).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText("Waits for Task c"));
    expect(onChange).toHaveBeenLastCalledWith({ waitsFor: ["c"] });
  });

  it("lets go of a wait, and hands removal to the confirmation", () => {
    const a = item("a");
    const b = item("b", { waitsFor: ["a"] });
    const { onChange, onRemove } = setup(b, [a, b]);
    fireEvent.click(screen.getByLabelText("Waits for Task a"));
    expect(onChange).toHaveBeenLastCalledWith({ waitsFor: [] });
    fireEvent.click(screen.getByRole("button", { name: /Remove Task/ }));
    expect(onRemove).toHaveBeenCalled();
  });

  it("asks a preboarding's joiner only for fields the preboarding page can show", () => {
    const a = item("a", { kind: "FILL_FIELDS" });
    setup(a, [a], "PREBOARDING");
    expect(screen.getByText("Emergency phone")).toBeInTheDocument();
    expect(screen.queryByText("Mentor")).not.toBeInTheDocument();
  });
});
