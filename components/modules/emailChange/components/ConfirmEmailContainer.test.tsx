import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ActionStatus } from "@/components/models/ActionStatus";
import { ConfirmEmailContainer } from "./ConfirmEmailContainer";

const confirm = jest.fn();
jest.mock("@/components/modules/emailChange/actions/emailChangeActions", () => ({
  confirmEmailChangeAction: (token: string) => confirm(token),
}));

describe("ConfirmEmailContainer", () => {
  beforeEach(() => confirm.mockReset());

  it("does nothing until the person presses the button — a mail scanner opening the link must not use it", () => {
    render(<ConfirmEmailContainer token="t" firstName="Ada" newEmail="ada.new@example.com" />);

    expect(confirm).not.toHaveBeenCalled();
    expect(screen.getByText("ada.new@example.com")).toBeInTheDocument();
  });

  it("confirms with the link's token and says which address is the login now", async () => {
    confirm.mockResolvedValue({ status: ActionStatus.SUCCESS, data: { email: "ada.new@example.com", subdomain: "acme" } });
    render(<ConfirmEmailContainer token="t" firstName="Ada" newEmail="ada.new@example.com" />);

    fireEvent.click(screen.getByRole("button", { name: "Confirm Email" }));

    await waitFor(() => expect(screen.getByText("Email Confirmed")).toBeInTheDocument());
    expect(confirm).toHaveBeenCalledWith("t");
  });

  it("shows the refusal of a stale link", async () => {
    confirm.mockResolvedValue({
      status: ActionStatus.ERROR,
      code: "AUTH00005",
      errorMessage: "This email confirmation link is no longer valid.",
    });
    render(<ConfirmEmailContainer token="t" firstName={null} newEmail="ada.new@example.com" />);

    fireEvent.click(screen.getByRole("button", { name: "Confirm Email" }));

    await waitFor(() => expect(screen.getByText("This email confirmation link is no longer valid.")).toBeInTheDocument());
  });
});
