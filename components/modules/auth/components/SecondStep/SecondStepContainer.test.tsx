import * as React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SecondStepContainer } from "./SecondStepContainer";
import { useAuthService } from "@/components/modules/auth/hooks/useAuthService";
import { ApiError } from "@/components/clients/exceptions";
import { ActionStatus } from "@/components/models/ActionStatus";
import { confirmMfaReplacementAction, startMfaReplacementAction } from "@/components/modules/mfa/actions";
import { partialMock } from "@/test/types";

jest.mock("@/components/modules/auth/hooks/useAuthService");
jest.mock("@/components/modules/mfa/actions", () => ({
  startMfaReplacementAction: jest.fn(),
  confirmMfaReplacementAction: jest.fn(),
}));
jest.mock("qrcode", () => ({ __esModule: true, default: { toDataURL: () => Promise.resolve("data:image/png;base64,") } }));

const describeMfaChallenge = jest.fn();
const verifyMfa = jest.fn();
const enrolAtSignInStart = jest.fn();

beforeEach(() => {
  describeMfaChallenge.mockReset();
  verifyMfa.mockReset();
  enrolAtSignInStart.mockReset();
  jest.mocked(startMfaReplacementAction).mockReset();
  jest.mocked(confirmMfaReplacementAction).mockReset();
  // The first ask finds the challenge; once a backup code has logged in, it is spent.
  describeMfaChallenge
    .mockResolvedValueOnce({ rememberDays: 30 })
    .mockRejectedValue(new ApiError("gone", { status: 401, code: "AUTH00007" }));
  verifyMfa.mockResolvedValue({ backupCodesLeft: 9 });
  jest.mocked(startMfaReplacementAction).mockResolvedValue({
    status: ActionStatus.SUCCESS,
    data: { otpauthUri: "otpauth://totp/x?secret=AAAA", secret: "AAAABBBB" },
  });
  // A new service object on every render, as when the session cookie gives the page a new client.
  jest.mocked(useAuthService).mockImplementation(() =>
    partialMock<ReturnType<typeof useAuthService>>({ describeMfaChallenge, verifyMfa, enrolAtSignInStart }));
});

async function logInWithABackupCode(user: ReturnType<typeof userEvent.setup>) {
  render(<SecondStepContainer brand={{ kind: "noddo" }} returnTo="/dashboard" />);
  await user.click(await screen.findByRole("button", { name: "Use a backup code" }));
  await user.type(screen.getByLabelText("Backup code"), "WALK-CODE-0001");
  await user.click(screen.getByRole("button", { name: "Log in" }));
}

// D3: after a backup code, "You're logged in" with the codes left — not "Your login timed out" (walk of 2026-11-19).
describe("SecondStepContainer (D2 → D3)", () => {
  it("shows the codes left after a backup code, and asks for the challenge only once", async () => {
    const user = userEvent.setup();
    await logInWithABackupCode(user);

    expect(await screen.findByRole("heading", { name: "You’re logged in" })).toBeInTheDocument();
    expect(screen.queryByText("Your login timed out")).not.toBeInTheDocument();
    expect(describeMfaChallenge).toHaveBeenCalledTimes(1);
  });

  it("offers only Continue while more than one code is left", async () => {
    const user = userEvent.setup();
    await logInWithABackupCode(user);

    expect(await screen.findByRole("button", { name: "Continue" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Set up again" })).not.toBeInTheDocument();
  });
});

// D3's "Set up again" (Q-17): with one code left or none, a new phone is set up right from the login.
describe("SecondStepContainer (D3 → D4, Set up again)", () => {
  it.each([1, 0])("with %i left offers Set up again and Later, and Set up again starts a new phone", async (left) => {
    verifyMfa.mockResolvedValue({ backupCodesLeft: left });
    const user = userEvent.setup();
    await logInWithABackupCode(user);

    expect(await screen.findByRole("button", { name: "Later" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Set up again" }));

    expect(await screen.findByRole("heading", { name: "Set up two-step login" })).toBeInTheDocument();
    expect(screen.getByText(/Your old phone keeps working until you turn the new one on/)).toBeInTheDocument();
    expect(startMfaReplacementAction).toHaveBeenCalledTimes(1);
    // The new phone is the signed-in replacement, never the login's enrolment.
    expect(enrolAtSignInStart).not.toHaveBeenCalled();
  });

  it("shows the new backup codes once the new phone's code is right", async () => {
    verifyMfa.mockResolvedValue({ backupCodesLeft: 0 });
    jest.mocked(confirmMfaReplacementAction).mockResolvedValue({
      status: ActionStatus.SUCCESS,
      data: { backupCodes: ["AAAA-BBBB-CCCC", "DDDD-EEEE-FFFF"] },
    });
    const user = userEvent.setup();
    await logInWithABackupCode(user);
    await user.click(await screen.findByRole("button", { name: "Set up again" }));
    await screen.findByRole("heading", { name: "Set up two-step login" });

    // The code box sends itself on the sixth digit.
    await user.type(screen.getAllByRole("textbox")[0], "123456");

    expect(await screen.findByRole("heading", { name: "Save your backup codes" })).toBeInTheDocument();
    expect(screen.getByText("AAAA-BBBB-CCCC")).toBeInTheDocument();
    expect(confirmMfaReplacementAction).toHaveBeenCalledWith("123456");
  });

  it("says a wrong code next to the field and keeps D4", async () => {
    verifyMfa.mockResolvedValue({ backupCodesLeft: 1 });
    jest.mocked(confirmMfaReplacementAction).mockResolvedValue({
      status: ActionStatus.ERROR, code: "AUTH00008", errorMessage: "The code is not correct",
    });
    const user = userEvent.setup();
    await logInWithABackupCode(user);
    await user.click(await screen.findByRole("button", { name: "Set up again" }));
    await screen.findByRole("heading", { name: "Set up two-step login" });

    await user.type(screen.getAllByRole("textbox")[0], "123456");

    expect(await screen.findByText("That code doesn’t match. Check the time on your phone and try again.")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Set up two-step login" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Save your backup codes" })).not.toBeInTheDocument();
    expect(confirmMfaReplacementAction).toHaveBeenCalledTimes(1);
  });
});
