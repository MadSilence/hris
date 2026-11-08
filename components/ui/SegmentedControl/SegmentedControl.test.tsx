import * as React from "react";
import { fireEvent, render, screen } from "@testing-library/react";

import { SegmentedControl } from "./SegmentedControl";

type Pick = "BEFORE" | "AFTER" | "ON";

const Harness: React.FC<{ initial?: Pick | null; disabledOn?: boolean; onChange?: (v: Pick) => void }> = ({
  initial = "BEFORE",
  disabledOn = false,
  onChange,
}) => {
  const [value, setValue] = React.useState<Pick | null>(initial);
  return (
    <SegmentedControl<Pick>
      aria-label="When"
      value={value}
      onChange={(v) => {
        setValue(v);
        onChange?.(v);
      }}
      options={[
        { value: "BEFORE", label: "Before" },
        { value: "ON", label: "On", disabled: disabledOn },
        { value: "AFTER", label: "After" },
      ]}
    />
  );
};

describe("SegmentedControl", () => {
  it("is a radio group with the picked segment checked and the only tab stop", () => {
    render(<Harness />);
    expect(screen.getByRole("radiogroup", { name: "When" })).toBeInTheDocument();
    const before = screen.getByRole("radio", { name: "Before" });
    expect(before).toHaveAttribute("aria-checked", "true");
    expect(before).toHaveAttribute("tabindex", "0");
    expect(screen.getByRole("radio", { name: "After" })).toHaveAttribute("tabindex", "-1");
  });

  it("moves the pick with the arrow keys and wraps", () => {
    const onChange = jest.fn();
    render(<Harness onChange={onChange} />);
    const before = screen.getByRole("radio", { name: "Before" });
    fireEvent.keyDown(before, { key: "ArrowRight" });
    expect(onChange).toHaveBeenLastCalledWith("ON");
    expect(screen.getByRole("radio", { name: "On" })).toHaveFocus();
    fireEvent.keyDown(screen.getByRole("radio", { name: "On" }), { key: "ArrowRight" });
    expect(onChange).toHaveBeenLastCalledWith("AFTER");
    fireEvent.keyDown(screen.getByRole("radio", { name: "After" }), { key: "ArrowRight" });
    expect(onChange).toHaveBeenLastCalledWith("BEFORE");
    fireEvent.keyDown(screen.getByRole("radio", { name: "Before" }), { key: "ArrowLeft" });
    expect(onChange).toHaveBeenLastCalledWith("AFTER");
  });

  it("skips a disabled segment, and Home / End go to the ends", () => {
    const onChange = jest.fn();
    render(<Harness disabledOn onChange={onChange} />);
    fireEvent.keyDown(screen.getByRole("radio", { name: "Before" }), { key: "ArrowRight" });
    expect(onChange).toHaveBeenLastCalledWith("AFTER");
    fireEvent.keyDown(screen.getByRole("radio", { name: "After" }), { key: "Home" });
    expect(onChange).toHaveBeenLastCalledWith("BEFORE");
    fireEvent.keyDown(screen.getByRole("radio", { name: "Before" }), { key: "End" });
    expect(onChange).toHaveBeenLastCalledWith("AFTER");
  });

  it("picks on click, and with nothing picked the first segment takes the tab", () => {
    const onChange = jest.fn();
    render(<Harness initial={null} onChange={onChange} />);
    expect(screen.getByRole("radio", { name: "Before" })).toHaveAttribute("tabindex", "0");
    fireEvent.click(screen.getByRole("radio", { name: "After" }));
    expect(onChange).toHaveBeenCalledWith("AFTER");
  });
});
