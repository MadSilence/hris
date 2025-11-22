import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import DateSettings from "./DateSettings";

describe("DateSettings", () => {
  it("renders checkbox with label", () => {
    render(<DateSettings hideYearPublic={false} onChangeHideYearPublic={() => {
    }}/>);
    expect(screen.getByLabelText("Hide year from public")).toBeInTheDocument();
  });

  it("reflects checked prop", () => {
    const { rerender } = render(<DateSettings hideYearPublic={false} onChangeHideYearPublic={() => {
    }}/>);
    expect(screen.getByRole("checkbox")).not.toBeChecked();

    rerender(<DateSettings hideYearPublic={true} onChangeHideYearPublic={() => {
    }}/>);
    expect(screen.getByRole("checkbox")).toBeChecked();
  });

  it("calls onChangeHideYearPublic with toggled value", async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    render(<DateSettings hideYearPublic={false} onChangeHideYearPublic={onChange}/>);

    await user.click(screen.getByRole("checkbox"));
    expect(onChange).toHaveBeenCalledWith(true);
  });
});
