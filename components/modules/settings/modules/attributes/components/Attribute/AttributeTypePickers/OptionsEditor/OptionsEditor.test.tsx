import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { OptionsEditor } from "./OptionsEditor";
import { AttributeOption, AttributeOptionUpsert, AttributeType } from "@/models/attribute";

// The editor takes stored options, which carry ids and audit columns the tests never look at. Built
// here so the suite states only what it is about — value and colour.
let optionSeq = 0;

function option(value: string, color: string): AttributeOption {
  optionSeq += 1;

  return {
    id: `option-${optionSeq}`,
    value,
    color,
    sortOrder: optionSeq,
    createdAt: "2026-01-01T00:00:00Z",
    createdBy: "user-id",
    updatedAt: "2026-01-01T00:00:00Z",
    updatedBy: "user-id",
  };
}

function setup(initial: AttributeOption[] = [], type: AttributeType = AttributeType.SELECT) {
  const onChange = jest.fn();
  render(<OptionsEditor type={type} options={initial} onChange={onChange}/>);
  return { onChange };
}

describe("OptionsEditor", () => {
  it("renders existing options with placeholders and values", () => {
    setup(
      [
        option("Option A", "ocean"),
        option("Option B", "berry"),
      ],
      AttributeType.SELECT
    );

    expect(screen.getByPlaceholderText("Option 1")).toHaveValue("Option A");
    expect(screen.getByPlaceholderText("Option 2")).toHaveValue("Option B");
    expect(screen.getByLabelText("Color for option 1: Ocean")).toBeInTheDocument();
    expect(screen.getByLabelText("Color for option 2: Berry")).toBeInTheDocument();
  });

  it("adds an option on top of the auto-seeded first one", async () => {
    const user = userEvent.setup();
    const { onChange } = setup([]);

    // An options-type attribute can't have zero options, so the editor seeds one on mount and
    // reports it — clicking Add is therefore the second call, not the first.
    expect(onChange).toHaveBeenCalledTimes(1);

    await user.click(screen.getByRole("button", { name: /add option/i }));

    const next = onChange.mock.calls[onChange.mock.calls.length - 1][0] as AttributeOptionUpsert[];
    expect(next).toHaveLength(2);
    expect(next[1].value).toBe("Option 2");
    expect(next.map((o) => o.sortOrder)).toEqual([1, 2]);
  });

  it("updates option value when typing", async () => {
    const { onChange } = setup([option("", "indigo")]);

    const input = screen.getByPlaceholderText("Option 1");
    fireEvent.change(input, { target: { value: "Hello" } });

    const last = onChange.mock.calls[onChange.mock.calls.length - 1][0] as AttributeOption[];
    expect(last[0].value).toBe("Hello");
  });

  it("updates an option's tag color through the picker", async () => {
    const user = userEvent.setup();
    const { onChange } = setup([option("Red", "ocean")]);

    // The dot opens the eight tag colours, each shown by its name.
    await user.click(screen.getByLabelText("Color for option 1: Ocean"));
    await user.click(screen.getByRole("radio", { name: "Berry" }));

    const last = onChange.mock.calls[onChange.mock.calls.length - 1][0] as AttributeOptionUpsert[];
    expect(last[0].color).toBe("berry");
  });

  it("removes an option", async () => {
    const user = userEvent.setup();
    const { onChange } = setup(
      [
        option("One", "gray"),
        option("Two", "teal"),
      ],
      AttributeType.SELECT
    );

    await user.click(screen.getByRole("button", { name: /remove option 1/i }));

    const result = onChange.mock.calls[0][0] as AttributeOption[];
    expect(result).toHaveLength(1);
    expect(result[0].value).toBe("Two");
  });

});
