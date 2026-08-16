import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AttributeOptions } from "./AttributeOptions";
import { Attribute, AttributePatch } from "@/models/attribute/Attribute";
import { AttributeGroup } from "@/models/attribute/AttributeGroup";
import { AttributeType } from "@/models/attribute";

const attribute = (over: Partial<Attribute> = {}): Attribute => ({
  id: "a1",
  companyId: "c1",
  groupId: "g1",
  name: "Salary",
  type: AttributeType.NUMBER,
  sortOrder: 1,
  decScale: null,
  dateHideYear: null,
  system: false,
  unique: false,
  createdAt: "",
  updatedAt: "",
  createdBy: null,
  updatedBy: null,
  version: 1,
  ...over,
});

const group = (id: string, name: string): AttributeGroup => ({
  id,
  name,
  isSystem: false,
  sortOrder: 1,
  createdAt: "",
  createdBy: "",
  updatedAt: "",
  attributes: [],
});

function setup(over: Partial<Attribute> = {}) {
  const onChange = jest.fn<void, [AttributePatch]>();
  render(
    <AttributeOptions
      attribute={attribute(over)}
      groups={[group("g1", "HR information"), group("g2", "Payroll")]}
      onChange={onChange}
      onSave={jest.fn()}
    />
  );
  return { onChange };
}

const savedPatch = (onChange: jest.Mock): AttributePatch => {
  const calls = onChange.mock.calls;
  return calls[calls.length - 1][0];
};

describe("AttributeOptions", () => {
  it("sends a renamed attribute", async () => {
    const user = userEvent.setup();
    const { onChange } = setup();

    const nameInput = screen.getByLabelText("Name");
    await user.clear(nameInput);
    await user.type(nameInput, "Base salary");
    await user.click(screen.getByRole("button", { name: "Save" }));

    expect(savedPatch(onChange).name).toBe("Base salary");
  });

  it("blocks saving with an empty name", async () => {
    const user = userEvent.setup();
    setup();

    await user.clear(screen.getByLabelText("Name"));

    expect(screen.getByRole("button", { name: "Save" })).toBeDisabled();
  });

  it("shows the type as read-only — it can't be changed after creation", () => {
    setup();

    expect(screen.getByText(/can't be changed after the attribute is created/i)).toBeInTheDocument();
    // A combobox here would mean the type picker came back; only the group select may be one.
    expect(screen.getAllByRole("combobox")).toHaveLength(1);
  });

  it("sends the target group when the attribute is moved", async () => {
    const user = userEvent.setup();
    const { onChange } = setup();

    await user.click(screen.getByRole("combobox"));
    await user.click(screen.getByRole("option", { name: "Payroll" }));
    await user.click(screen.getByRole("button", { name: "Save" }));

    expect(savedPatch(onChange).groupId).toBe("g2");
  });

  it("asks the server to clear a constraint that was emptied", async () => {
    const user = userEvent.setup();
    const { onChange } = setup({ minValue: 10, maxValue: 100 });

    await user.clear(screen.getByLabelText("Min"));
    await user.click(screen.getByRole("button", { name: "Save" }));

    const patch = savedPatch(onChange);
    // A null in the patch means "leave as is", so emptying a field must be an explicit clear.
    expect(patch.clearFields).toEqual(["minValue"]);
    expect(patch.maxValue).toBe(100);
  });

  it("does not ask to clear constraints that were never set", async () => {
    const user = userEvent.setup();
    const { onChange } = setup();

    await user.click(screen.getByRole("button", { name: "Save" }));

    expect(savedPatch(onChange).clearFields).toBeUndefined();
  });

  it("carries the sensitive flag", async () => {
    const user = userEvent.setup();
    const { onChange } = setup();

    await user.click(screen.getByRole("switch", { name: /sensitive/i }));
    await user.click(screen.getByRole("button", { name: "Save" }));

    expect(savedPatch(onChange).sensitive).toBe(true);
  });

  it("offers Unique for text but not for numbers", () => {
    const { unmount } = render(
      <AttributeOptions attribute={attribute()} onChange={jest.fn()} />
    );
    expect(screen.queryByRole("switch", { name: /unique value/i })).not.toBeInTheDocument();
    unmount();

    render(
      <AttributeOptions attribute={attribute({ type: AttributeType.TEXT })} onChange={jest.fn()} />
    );
    expect(screen.getByRole("switch", { name: /unique value/i })).toBeInTheDocument();
  });

  it("locks every control for a system attribute", () => {
    render(
      <AttributeOptions attribute={attribute({ system: true })} onChange={jest.fn()} isPreset />
    );

    expect(screen.getByRole("button", { name: "Save" })).toBeDisabled();
    expect(screen.getByRole("switch", { name: /sensitive/i })).toBeDisabled();
  });
});
