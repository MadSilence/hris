import * as React from "react";
import { render, screen } from "@testing-library/react";

import { PasswordField } from "./PasswordField";

describe("PasswordField", () => {
  it("marks a required password with the asterisk, as every required field (walk of 2026-11-13, B2a)", () => {
    render(<PasswordField id="p" label="Password" value="" onChange={jest.fn()} required />);
    expect(screen.getByText("Password").closest("label")).toHaveTextContent("Password *");
  });

  it("says nothing when the password is optional", () => {
    render(<PasswordField id="p" label="Password" value="" onChange={jest.fn()} />);
    expect(screen.getByText("Password").closest("label")).toHaveTextContent(/^Password$/);
  });
});
