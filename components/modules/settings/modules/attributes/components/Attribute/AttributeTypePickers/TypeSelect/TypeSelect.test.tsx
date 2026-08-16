import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TypeSelect } from "./TypeSelect";
import { ALL_ATTRIBUTE_TYPES, AttributeType } from "@/models/attribute";
import { getAttributeTypeLabel } from "@/components/modules/settings/modules/attributes/utils/attributeTypeUtils";

// This is a Radix Select, not a native <select>: there is no <option> in the DOM until the listbox
// is opened, and picking a value goes through a click rather than selectOptions().
describe("TypeSelect", () => {
  it("shows the current type on the trigger", () => {
    render(<TypeSelect value={AttributeType.TEXT} onChange={() => {}} />);

    expect(screen.getByRole("combobox")).toHaveTextContent(
      getAttributeTypeLabel(AttributeType.TEXT)
    );
  });

  it("offers every attribute type once opened", async () => {
    const user = userEvent.setup();
    render(<TypeSelect value={AttributeType.TEXT} onChange={() => {}} />);

    await user.click(screen.getByRole("combobox"));

    expect(screen.getAllByRole("option")).toHaveLength(ALL_ATTRIBUTE_TYPES.length);
    expect(
      screen.getByRole("option", { name: getAttributeTypeLabel(AttributeType.EMAIL) })
    ).toBeInTheDocument();
  });

  it("calls onChange with the picked AttributeType", async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();

    render(<TypeSelect value={AttributeType.TEXT} onChange={onChange} />);

    await user.click(screen.getByRole("combobox"));
    await user.click(
      screen.getByRole("option", { name: getAttributeTypeLabel(AttributeType.URL) })
    );

    expect(onChange).toHaveBeenCalledWith(AttributeType.URL);
  });
});
