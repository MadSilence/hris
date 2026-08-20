import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { OptionsEditor } from "./OptionsEditor";
import { AttributeOption, AttributeOptionUpsert, AttributeType } from "@/models/attribute";
import { PRESET_COLORS } from "@/models/colors";

// The desact Button/Input render fine in jsdom and need no stubs. The SVG one does: the global
// svgMock isn't flagged `__esModule`, so the default import arrives as a module object and React
// refuses to render it.
jest.mock("@/public/icons/trash.svg", () => ({
  __esModule: true,
  default: () => <svg data-testid="trash-icon"/>,
}));

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
        option("Option A", "#111111"),
        option("Option B", "#222222"),
      ],
      AttributeType.SELECT
    );

    expect(screen.getByPlaceholderText("Option 1")).toHaveValue("Option A");
    expect(screen.getByPlaceholderText("Option 2")).toHaveValue("Option B");
    expect(screen.getByLabelText("Color for option 1")).toBeInTheDocument();
    expect(screen.getByLabelText("Color for option 2")).toBeInTheDocument();
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
    const { onChange } = setup([option("", "#4F46E5")]);

    const input = screen.getByPlaceholderText("Option 1");
    fireEvent.change(input, { target: { value: "Hello" } });

    const last = onChange.mock.calls[onChange.mock.calls.length - 1][0] as AttributeOption[];
    expect(last[0].value).toBe("Hello");
  });

  it("updates option color through the swatch picker", async () => {
    const user = userEvent.setup();
    const { onChange } = setup([option("Red", PRESET_COLORS[0])]);

    // The colour input became a swatch popover: open it, then pick a colour from the palette.
    await user.click(screen.getByLabelText("Color for option 1"));
    await user.click(screen.getByLabelText(`Choose ${PRESET_COLORS[1]}`));

    const last = onChange.mock.calls[onChange.mock.calls.length - 1][0] as AttributeOptionUpsert[];
    expect(last[0].color).toBe(PRESET_COLORS[1]);
  });

  it("removes an option", async () => {
    const user = userEvent.setup();
    const { onChange } = setup(
      [
        option("One", "#000000"),
        option("Two", "#ffffff"),
      ],
      AttributeType.SELECT
    );

    await user.click(screen.getByRole("button", { name: /remove option 1/i }));

    const result = onChange.mock.calls[0][0] as AttributeOption[];
    expect(result).toHaveLength(1);
    expect(result[0].value).toBe("Two");
  });

});
