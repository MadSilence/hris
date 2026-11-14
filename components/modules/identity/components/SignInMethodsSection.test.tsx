import * as React from "react";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { SignInMethodsSection } from "./SignInMethodsSection";
import type { SignInOverviewDTO } from "@/api/modules/identity/services";

const get = jest.fn();
jest.mock("@/components/providers/AppDataProvider", () => ({
  useAppDataContext: () => ({ internalApiClient: { get, post: jest.fn() } }),
}));
let impersonating = false;
jest.mock("@/components/providers/ImpersonationProvider", () => ({ useImpersonationContext: () => ({ isImpersonating: impersonating }) }));
jest.mock("../actions/personalSignInActions", () => ({
  setFirstPasswordAction: jest.fn(),
  removePasswordAction: jest.fn(),
  disconnectAccountAction: jest.fn(),
}));

const show = (overview: SignInOverviewDTO, returned: React.ComponentProps<typeof SignInMethodsSection>["returned"] = null) => {
  get.mockResolvedValue(overview);
  render(
    <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
      <SignInMethodsSection returned={returned} />
    </QueryClientProvider>,
  );
};

const google = { provider: "GOOGLE" as const, email: "ada@gmail.test", connectedAt: "2026-11-01T10:00:00Z", lastUsedAt: null };

describe("SignInMethodsSection (My Preferences → Ways to log in)", () => {
  it("a password that is the only way in has no Remove, and says why", async () => {
    show({ hasPassword: true, accounts: [], offered: ["GOOGLE", "MICROSOFT"], passwordRemovable: false });

    expect(await screen.findByText(/To remove it, connect another way to log in first/)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Remove password" })).not.toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: "Connect" })).toHaveLength(2);
  });

  it("somebody who logs in with Google alone can set a password and disconnect", async () => {
    show({ hasPassword: false, accounts: [google], offered: ["GOOGLE", "MICROSOFT"], passwordRemovable: false });

    expect(await screen.findByRole("button", { name: "Set a password" })).toBeInTheDocument();
    expect(screen.getByText(/ada@gmail.test · connected/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Disconnect" })).toBeInTheDocument();
  });

  it("an account the company no longer offers stays listed, can be disconnected, not connected again", async () => {
    show({ hasPassword: true, accounts: [google], offered: [], passwordRemovable: false });

    expect(await screen.findByText("Your company has turned this way to log in off.")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Connect" })).not.toBeInTheDocument();
  });

  it("an account somebody else here uses says so (I9)", async () => {
    show({ hasPassword: true, accounts: [], offered: ["GOOGLE"], passwordRemovable: false }, "inUse");

    expect(await screen.findByText("This account is already connected to someone else in this company.")).toBeInTheDocument();
  });

  it("shows nothing of a person's ways in to somebody acting as them (L5)", async () => {
    impersonating = true;
    get.mockClear();
    show({ hasPassword: true, accounts: [google], offered: ["GOOGLE"], passwordRemovable: true });
    expect(await screen.findByText("Not shown while you act as somebody else.")).toBeInTheDocument();
    expect(screen.queryByText(/ada@gmail.test/)).not.toBeInTheDocument();
    expect(get).not.toHaveBeenCalled();
    impersonating = false;
  });
});
