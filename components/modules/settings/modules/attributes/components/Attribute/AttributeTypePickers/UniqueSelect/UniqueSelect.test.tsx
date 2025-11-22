import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import UniqueSelect from "./UniqueSelect";

describe("UniqueSelect", () => {
  it("renders label", () => {
    render(<UniqueSelect checked={false} onChange={() => {
    }}/>);
    expect(screen.getByText("Unique")).toBeInTheDocument();
  });

  it("reflects checked prop", () => {
    const { rerender } = render(<UniqueSelect checked={false} onChange={() => {
    }}/>);
    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).not.toBeChecked();

    rerender(<UniqueSelect checked={true} onChange={() => {
    }}/>);
    expect(screen.getByRole("checkbox")).toBeChecked();
  });

  it("calls onChange with toggled value when clicked from false -> true", async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    render(<UniqueSelect checked={false} onChange={onChange}/>);
    await user.click(screen.getByRole("checkbox"));
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it("calls onChange with toggled value when clicked from true -> false", async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    render(<UniqueSelect checked={true} onChange={onChange}/>);
    await user.click(screen.getByRole("checkbox"));
    expect(onChange).toHaveBeenCalledWith(false);
  });
});
