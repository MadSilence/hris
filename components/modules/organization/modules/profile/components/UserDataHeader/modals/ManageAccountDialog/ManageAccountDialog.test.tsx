import * as React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { ManageAccountDialog } from "./ManageAccountDialog";
import type { AccountOverviewDTO, PersonSessionDTO } from "@/api/modules/userAccount/dto";
import type { PersonEmails } from "@/models/email";
import type { User } from "@/models/user/User";
import { partialMock } from "@/test/types";

const responses = new Map<string, unknown>();
const answer = async (path: string) => {
  const key = [...responses.keys()].find((prefix) => path.startsWith(prefix));
  const value = key ? responses.get(key) : undefined;
  if (value instanceof Error) throw value;
  return value;
};
const get = jest.fn(answer);
const post = jest.fn(async () => ({ ok: true }));
jest.mock("@/components/providers/AppDataProvider", () => ({
  useAppDataContext: () => ({ internalApiClient: { get, post } }),
}));
jest.mock("@/components/providers/CurrentUserProvider/CurrentUserProvider", () => ({
  useCurrentUser: () => ({ userId: "me", impersonating: false }),
}));
jest.mock("@/components/auth/useAccess", () => ({ useCanAccess: () => false }));
jest.mock("@/components/modules/mfa/stepUp", () => ({ withStepUpAction: (run: () => unknown) => run() }));
jest.mock("@/components/modules/identity/actions", () => ({ unlinkPersonFromProviderAction: jest.fn() }));
const tryEmailAgainAction = jest.fn();
jest.mock("@/components/modules/email/actions", () => ({
  tryEmailAgainAction: (...args: unknown[]) => tryEmailAgainAction(...args),
}));
jest.mock("@/components/modules/sessions/actions", () => ({ endAllSessionsOfUserAction: jest.fn() }));
jest.mock("@/components/modules/organization/modules/profile/actions/userLifecycleActions/userLifecycleActions", () => ({
  sendPasswordResetAction: jest.fn(),
  unblockUserAction: jest.fn(),
  blockUserAction: jest.fn(),
  unlockUserAction: jest.fn(),
}));
jest.mock("@/components/modules/organization/modules/profile/actions/manageAccountActions", () => ({
  endPersonSessionAction: jest.fn(),
  unlinkPersonSignInAccountAction: jest.fn(),
}));
jest.mock("@/components/modules/organization/modules/profile/actions/exportPersonalData", () => ({
  exportPersonalData: jest.fn(),
}));
const resetUserMfaAction = jest.fn();
jest.mock("@/components/modules/mfa/actions", () => ({
  resetUserMfaAction: (...args: unknown[]) => resetUserMfaAction(...args),
}));
const showSuccess = jest.fn();
jest.mock("@/lib/errors/errorToast", () => ({
  showSuccess: (...args: unknown[]) => showSuccess(...args),
  showActionError: jest.fn(),
  showError: jest.fn(),
}));

const overview = (over: Partial<AccountOverviewDTO> = {}): AccountOverviewDTO => ({
  userId: "u1",
  accountStatus: "ACTIVE",
  blockedAt: null,
  blockedBy: null,
  locked: false,
  loginRestrictedUntil: null,
  password: { hasPassword: true, changedAt: null },
  twoStep: { method: "AUTHENTICATOR_APP", enrolledAt: "2026-10-01T10:00:00Z", required: false },
  linkedAccounts: [{ provider: "GOOGLE", email: "reza@gmail.test", connectedAt: "2026-10-01T10:00:00Z", lastUsedAt: null }],
  companySso: false,
  mayReset: true,
  ...over,
});

const session = (id: string, ua: string): PersonSessionDTO => ({
  id,
  authMethod: "PASSWORD",
  createdAt: "2026-11-01T10:00:00Z",
  lastSeenAt: "2026-11-01T10:00:00Z",
  userAgent: ua,
  ip: null,
  isCurrent: false,
});

const emails = (total: number): PersonEmails => ({
  address: "reza@example.test",
  suppression: null,
  emails: Array.from({ length: Math.min(total, 20) }, (_, i) => ({
    id: `e${i}`,
    kind: "NOTIFICATION",
    templateKey: "x",
    subject: `Subject ${i}`,
    status: "SENT",
    createdAt: "2026-11-18T14:02:00Z",
    sentAt: "2026-11-18T14:02:00Z",
    lastError: null,
  })),
  total,
  page: 0,
  size: 20,
});

const person = (rights: ("VIEW" | "EDIT" | "MANAGE" | "BLOCK")[]) =>
  partialMock<User>({
    id: "u1",
    firstName: "Reza",
    lastName: "Karimi",
    email: "reza@example.test",
    capabilities: { "PEOPLE.PROFILE": rights },
  });

const show = (rights: ("VIEW" | "EDIT" | "MANAGE" | "BLOCK")[]) =>
  render(
    <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
      <ManageAccountDialog open onCloseAction={jest.fn()} user={person(rights)} fullName="Reza Karimi" onChangedAction={jest.fn()} />
    </QueryClientProvider>,
  );

const MAC = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Safari/537.36";
const IPHONE = "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1";

beforeEach(() => {
  responses.clear();
  get.mockReset();
  get.mockImplementation(answer);
  tryEmailAgainAction.mockReset();
  resetUserMfaAction.mockReset();
  showSuccess.mockReset();
});

describe("ManageAccountDialog (MA1–MA6)", () => {
  it("shows a BLOCK holder the login and the sessions, and hides what needs another right", async () => {
    responses.set("/users/u1/account", overview());
    responses.set("/users/u1/sessions", [session("s1", MAC), session("s2", IPHONE)]);
    show(["VIEW", "BLOCK"]);

    expect(await screen.findByText("Sessions · 2 devices")).toBeInTheDocument();
    expect(screen.getByText("Mac · Chrome")).toBeInTheDocument();
    expect(screen.getByText("Send reset link")).toBeInTheDocument();
    expect(screen.getByText("On · authenticator app")).toBeInTheDocument();
    expect(screen.getByText("reza@gmail.test")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Block account" })).toBeInTheDocument();
    // Emails sent needs MANAGE, the export EDIT: neither is asked for nor shown.
    expect(screen.queryByText(/Emails sent/)).not.toBeInTheDocument();
    expect(screen.queryByText("Personal data")).not.toBeInTheDocument();
    expect(get).not.toHaveBeenCalledWith(expect.stringContaining("/emails"));
  });

  it("shows a blocked account with its date, no devices and Unblock (MA2)", async () => {
    responses.set("/users/u1/account", overview({ accountStatus: "BLOCKED", blockedAt: "2026-11-03T09:00:00Z" }));
    responses.set("/users/u1/sessions", []);
    show(["BLOCK"]);

    expect(await screen.findByText("Blocked")).toBeInTheDocument();
    expect(screen.getByText(/can’t log in/)).toBeInTheDocument();
    expect(screen.getByText("No devices")).toBeInTheDocument();
    expect(screen.getByText("Logged out when the account was blocked")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Unblock account" })).toBeInTheDocument();
    expect(screen.queryByText("Send reset link")).not.toBeInTheDocument();
  });

  it("lists every email in the same dialog, a page at a time (MA3)", async () => {
    responses.set("/users/u1/account", overview());
    responses.set("/users/u1/sessions", []);
    responses.set("/users/u1/emails", emails(26));
    show(["BLOCK", "MANAGE", "EDIT"]);

    expect(await screen.findByText("Emails sent · 26")).toBeInTheDocument();
    expect(screen.getByText("Personal data")).toBeInTheDocument();
    expect(screen.getAllByText(/^Subject \d+$/)).toHaveLength(3);

    fireEvent.click(screen.getByRole("button", { name: "Show all" }));
    expect(await screen.findByText("26 emails to reza@example.test")).toBeInTheDocument();
    expect(screen.getAllByText(/^Subject \d+$/)).toHaveLength(20);
    expect(screen.getByRole("button", { name: "Show 6 more" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Back" }));
    expect(await screen.findByText("Manage account")).toBeInTheDocument();
  });

  it("keeps the header and says the account did not load (MA6)", async () => {
    responses.set("/users/u1/account", new Error("boom"));
    responses.set("/users/u1/sessions", []);
    show(["BLOCK"]);

    expect(await screen.findByText("We couldn’t load the account")).toBeInTheDocument();
    expect(screen.getByText("Nothing is lost. Try again in a moment.")).toBeInTheDocument();
    expect(screen.getByText("Manage account")).toBeInTheDocument();
  });

  it("shows a session's device and time, the address only in its tooltip (B2)", async () => {
    responses.set("/users/u1/account", overview());
    responses.set("/users/u1/sessions", [{ ...session("s1", MAC), ip: "203.0.113.7" }]);
    show(["BLOCK"]);

    expect(await screen.findByText("Mac · Chrome")).toBeInTheDocument();
    expect(screen.queryByText(/203\.0\.113\.7/)).not.toBeInTheDocument();
  });

  it("puts a bounced address first in Login, and Try again sends it again (AQ-08)", async () => {
    responses.set("/users/u1/account", overview());
    responses.set("/users/u1/sessions", []);
    responses.set("/users/u1/emails", {
      ...emails(1),
      suppression: { reason: "HARD_BOUNCE", since: "2026-11-12T09:00:00Z" },
    });
    tryEmailAgainAction.mockResolvedValue({ status: "SUCCESS", data: { lifted: true, resent: null } });
    show(["BLOCK", "MANAGE"]);

    expect(await screen.findByText(/^Bounced on .* · reza@example\.test$/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Try again" }));
    await waitFor(() => expect(tryEmailAgainAction).toHaveBeenCalledWith("u1"));
    await waitFor(() => expect(showSuccess).toHaveBeenCalledWith("Email sent again"));
  });

  it("says Inactive, not Blocked, for a person set to inactive, and offers no Unblock (U8)", async () => {
    responses.set("/users/u1/account", overview({ accountStatus: "BLOCKED", blockedBy: "INACTIVE", blockedAt: "2026-11-03T09:00:00Z" }));
    responses.set("/users/u1/sessions", []);
    show(["BLOCK"]);

    expect(await screen.findByText("Inactive")).toBeInTheDocument();
    expect(screen.queryByText("Blocked")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Unblock account" })).not.toBeInTheDocument();
  });

  it("unblocks in a window with an optional reason (AQ-07, B3)", async () => {
    responses.set("/users/u1/account", overview({ accountStatus: "BLOCKED", blockedBy: "PERSON" }));
    responses.set("/users/u1/sessions", []);
    show(["BLOCK"]);

    fireEvent.click(await screen.findByRole("button", { name: "Unblock account" }));
    expect(await screen.findByText("Unblock Reza’s account?")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("For example: laptop found")).toBeInTheDocument();
  });

  it("resets two-step login in one window, the password red when it does not match (AQ-06, U3)", async () => {
    responses.set("/users/u1/account", overview());
    responses.set("/users/u1/sessions", []);
    responses.set("/auth/mfa", { enrolled: false, required: false, backupCodesLeft: 0, rememberAllowed: false, trustedDevices: [] });
    responses.set("/me/sign-in", { hasPassword: true, accounts: [], offered: [], passwordRemovable: false });
    resetUserMfaAction.mockResolvedValueOnce({ status: "ERROR", code: "AUTH00004", errorMessage: "x" });
    resetUserMfaAction.mockResolvedValueOnce({ status: "SUCCESS" });
    show(["BLOCK"]);

    fireEvent.click(await screen.findByRole("button", { name: "Reset" }));
    expect(await screen.findByText("Reset Reza’s two-step login?")).toBeInTheDocument();
    const field = await screen.findByLabelText("Your password");
    fireEvent.change(field, { target: { value: "wrong" } });
    fireEvent.click(screen.getByLabelText("I checked it’s really Reza, another way than email"));
    fireEvent.click(screen.getAllByRole("button", { name: "Reset" }).at(-1)!);

    expect(await screen.findByText("That password doesn’t match")).toBeInTheDocument();
    expect(resetUserMfaAction).toHaveBeenCalledWith("u1", true, { password: "wrong" });

    fireEvent.change(field, { target: { value: "right" } });
    fireEvent.click(screen.getAllByRole("button", { name: "Reset" }).at(-1)!);
    await waitFor(() => expect(showSuccess).toHaveBeenCalledWith("Two-step login reset"));
  });

  it("offers no Reset of two-step login the server would refuse — a protected account to a non-owner", async () => {
    responses.set("/users/u1/account", overview({ mayReset: false }));
    responses.set("/users/u1/sessions", []);
    responses.set("/auth/mfa", { enrolled: false, required: false, backupCodesLeft: 0, rememberAllowed: false, trustedDevices: [] });
    responses.set("/me/sign-in", { hasPassword: true, accounts: [], offered: [], passwordRemovable: false });
    show(["BLOCK"]);

    expect(await screen.findByText("Two-step login")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Reset" })).not.toBeInTheDocument();
  });
});
