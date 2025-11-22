import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import TypeSelect from "./TypeSelect";
import { AttributeType } from "@/models/attribute";

describe("TypeSelect", () => {
  it("renders label, select and all enum options", () => {
    render(<TypeSelect value={AttributeType.TEXT} onChange={() => {
    }}/>);

    const select = screen.getByLabelText("Type");
    expect(select).toBeInTheDocument();

    const options = screen.getAllByRole("option");
    expect(options.length).toBe(Object.values(AttributeType).length);

    expect(screen.getByRole("option", { name: /Email/i })).toBeInTheDocument();
  });

  it("calls onChange with selected AttributeType", async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();

    render(<TypeSelect value={AttributeType.TEXT} onChange={onChange}/>);

    const select = screen.getByLabelText("Type");
    await user.selectOptions(select, AttributeType.URL);

    expect(onChange).toHaveBeenCalledWith(AttributeType.URL);
  });
});
