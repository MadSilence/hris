import * as React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SecondStepContainer } from "./SecondStepContainer";
import { useAuthService } from "@/components/modules/auth/hooks/useAuthService";
import { ApiError } from "@/components/clients/exceptions";
import { partialMock } from "@/test/types";

jest.mock("@/components/modules/auth/hooks/useAuthService");

const describeMfaChallenge = jest.fn();
const verifyMfa = jest.fn();

beforeEach(() => {
  describeMfaChallenge.mockReset();
  verifyMfa.mockReset();
  // The first ask finds the challenge; once a backup code has logged in, it is spent.
  describeMfaChallenge
    .mockResolvedValueOnce({ rememberDays: 30 })
    .mockRejectedValue(new ApiError("gone", { status: 401, code: "AUTH00007" }));
  verifyMfa.mockResolvedValue({ backupCodesLeft: 9 });
  // A new service object on every render, as when the session cookie gives the page a new client.
  jest.mocked(useAuthService).mockImplementation(() => partialMock<ReturnType<typeof useAuthService>>({ describeMfaChallenge, verifyMfa }));
});

// D3: after a backup code, "You're logged in" with the codes left — not "Your login timed out" (walk of 2026-11-19).
describe("SecondStepContainer (D2 → D3)", () => {
  it("shows the codes left after a backup code, and asks for the challenge only once", async () => {
    const user = userEvent.setup();
    render(<SecondStepContainer brand={{ kind: "noddo" }} returnTo="/dashboard" />);

    await user.click(await screen.findByRole("button", { name: "Use a backup code" }));
    await user.type(screen.getByLabelText("Backup code"), "WALK-CODE-0001");
    await user.click(screen.getByRole("button", { name: "Log in" }));

    expect(await screen.findByRole("heading", { name: "You’re logged in" })).toBeInTheDocument();
    expect(screen.queryByText("Your login timed out")).not.toBeInTheDocument();
    expect(describeMfaChallenge).toHaveBeenCalledTimes(1);
  });
});
