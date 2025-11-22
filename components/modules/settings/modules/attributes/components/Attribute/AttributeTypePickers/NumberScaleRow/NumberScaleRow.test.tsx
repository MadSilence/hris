import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import NumberScaleRow from "./NumberScaleRow";

describe("NumberScaleRow", () => {
  it("renders with label and placeholder", () => {
    render(<NumberScaleRow value={null} onChange={() => {
    }}/>);
    expect(screen.getByLabelText("Decimal scale (optional)")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("e.g., 2")).toBeInTheDocument();
  });

  it("passes error text down to Input (snapshot via presence)", () => {
    render(<NumberScaleRow value={null} error="Oops" onChange={() => {
    }}/>);
    expect(screen.getByText("Oops")).toBeInTheDocument();
  });

  it("calls onChange with number when typing", async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    render(<NumberScaleRow value={null} onChange={onChange}/>);

    const input = screen.getByLabelText("Decimal scale (optional)");
    await user.clear(input);
    await user.type(input, "3");

    expect(onChange).toHaveBeenLastCalledWith(3);
  });

  it("calls onChange with null when cleared", async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    render(<NumberScaleRow value={5} onChange={onChange}/>);

    const input = screen.getByLabelText("Decimal scale (optional)");
    await user.clear(input);

    expect(onChange).toHaveBeenLastCalledWith(null);
  });
});
