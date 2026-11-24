import { fireEvent, render, screen } from "@testing-library/react";

import { IdentitySettings } from "./IdentitySettings";
import { identityConnection } from "@/test/fixtures/identityConnection";
import type { IdentityConnectionDTO } from "@/api/modules/identity/dto";

let connection: IdentityConnectionDTO = identityConnection();
jest.mock("@/components/modules/identity/hooks", () => ({
  useIdentityConnection: () => ({ data: connection, isLoading: false, error: null, refetch: jest.fn() }),
  useIdpGroups: () => ({ data: [], isLoading: false, error: null }),
  useScimTokens: () => ({ data: [], isLoading: false, error: null }),
  useInvalidateIdentity: () => jest.fn(),
}));
jest.mock("@/components/modules/settings/modules/roles/hooks/useRoles", () => ({ useRoles: () => ({ data: [] }) }));
jest.mock("@/components/providers/AppDataProvider", () => ({ useAppDataContext: () => ({ internalApiClient: {} }) }));
jest.mock("@/components/modules/identity/actions", () => ({
  issueScimTokenAction: jest.fn(),
  mapIdpGroupAction: jest.fn(),
  removeIdentityConnectionAction: jest.fn(),
  revokeScimTokenAction: jest.fn(),
  saveIdentityConnectionAction: jest.fn(),
  testIdentityConnectionAction: jest.fn(),
}));
const explain = jest.fn();
jest.mock("@/lib/feedback/explainToast", () => ({ explain: (m: string) => explain(m) }));

/*
  The provider and its trusts are the System Owner's alone (A-4). An Admin manages the rest of single sign-on, so
  sees the owner's fields as they are — never greyed (NEVER-DISABLED) — and, pressed, is told whose they are.
*/
describe("IdentitySettings — the owner's fields", () => {
  beforeEach(() => explain.mockClear());

  it("tells somebody who is not an owner whose the trust is, and leaves it as it was", () => {
    connection = identityConnection({ mayChangeProvider: false });
    render(<IdentitySettings/>);

    const trust = screen.getByRole("checkbox", { name: /two-step/i });
    expect(trust).not.toBeDisabled();
    fireEvent.click(trust);

    expect(explain).toHaveBeenCalledWith("Only a System Owner can change this.");
    expect(trust).not.toBeChecked();
    expect(screen.queryByRole("button", { name: "Remove" })).not.toBeInTheDocument();
  });

  it("lets an owner change it", () => {
    connection = identityConnection({ mayChangeProvider: true });
    render(<IdentitySettings/>);

    const trust = screen.getByRole("checkbox", { name: /two-step/i });
    fireEvent.click(trust);

    expect(explain).not.toHaveBeenCalled();
    expect(trust).toBeChecked();
  });
});
