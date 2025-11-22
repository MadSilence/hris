import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import OptionsEditor from "./OptionsEditor";
import { AttributeOption, AttributeType } from "@/models/attribute";

jest.mock("@/components/ui/Button", () => ({
  __esModule: true,
  Button: (props: React.ButtonHTMLAttributes<HTMLButtonElement>) => <button {...props} />,
}));

jest.mock("@/components/ui/Input/Input", () => ({
  __esModule: true,
  default: (props: any) => <input {...props} />,
}));

jest.mock("@/public/icons/trash.svg", () => ({
  __esModule: true,
  default: () => <svg data-testid="trash-icon"/>,
}));

function setup(initial: AttributeOption[] = [], type: AttributeType = AttributeType.SELECT) {
  const onChange = jest.fn();
  render(<OptionsEditor type={type} options={initial} onChange={onChange}/>);
  return { onChange };
}

describe("OptionsEditor", () => {
  it("renders existing options with placeholders and values", () => {
    setup(
      [
        { value: "Option A", color: "#111111" },
        { value: "Option B", color: "#222222" },
      ],
      AttributeType.SELECT
    );

    expect(screen.getByPlaceholderText("Option 1")).toHaveValue("Option A");
    expect(screen.getByPlaceholderText("Option 2")).toHaveValue("Option B");
    expect(screen.getByLabelText("Color for option 1")).toBeInTheDocument();
    expect(screen.getByLabelText("Color for option 2")).toBeInTheDocument();
  });

  it("adds a new empty option when clicking Add option", async () => {
    const user = userEvent.setup();
    const { onChange } = setup([]);

    await user.click(screen.getByRole("button", { name: /add option/i }));

    expect(onChange).toHaveBeenCalledTimes(1);
    const next = onChange.mock.calls[0][0] as AttributeOption[];
    expect(next).toHaveLength(1);
    expect(next[0]).toEqual({ value: "", color: "#4F46E5" });
  });

  it("updates option value when typing", async () => {
    const { onChange } = setup([{ value: "", color: "#4F46E5" }]);

    const input = screen.getByPlaceholderText("Option 1");
    fireEvent.change(input, { target: { value: "Hello" } });

    const last = onChange.mock.calls[onChange.mock.calls.length - 1][0] as AttributeOption[];
    expect(last[0].value).toBe("Hello");
  });

  it("updates option color", async () => {
    const { onChange } = setup([{ value: "Red", color: "#4F46E5" }]);

    const color = screen.getByLabelText("Color for option 1") as HTMLInputElement;
    fireEvent.input(color, { target: { value: "#ff0000" } });

    const last = onChange.mock.calls[onChange.mock.calls.length - 1][0] as AttributeOption[];
    expect(last[0].color.toLowerCase()).toBe("#ff0000");
  });

  it("removes an option", async () => {
    const user = userEvent.setup();
    const { onChange } = setup(
      [
        { value: "One", color: "#000000" },
        { value: "Two", color: "#ffffff" },
      ],
      AttributeType.SELECT
    );

    await user.click(screen.getByRole("button", { name: /remove option 1/i }));

    const result = onChange.mock.calls[0][0] as AttributeOption[];
    expect(result).toHaveLength(1);
    expect(result[0].value).toBe("Two");
  });

  it("uses status aria-label when type is STATUS", () => {
    const onChange = jest.fn();
    render(
      <OptionsEditor
        type={AttributeType.STATUS}
        options={[{ value: "Active", color: "#00ff00" }]}
        onChange={onChange}
      />
    );
    expect(screen.getByLabelText("Status option 1")).toBeInTheDocument();
  });
});
