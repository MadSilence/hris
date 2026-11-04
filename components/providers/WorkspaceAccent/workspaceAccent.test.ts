/**
 * `workspaceAccent` fails silently on purpose — a colour is never worth an error screen — which is exactly the
 * kind of behaviour nobody notices breaking. These pin the gates: no session and no company means no request at
 * all and the default; a failing backend means the default, not a thrown render; and a company's own address
 * wears its colour before anybody signs in.
 */
const cookieValue: { current: string | undefined } = { current: undefined };
const subdomain: { current: string | null } = { current: null };
const getAppearance = jest.fn();
const publicAppearanceFor = jest.fn();

jest.mock("next/headers", () => ({
  cookies: async () => ({
    get: (name: string) => (name === "__Host-access_token" && cookieValue.current ? { value: cookieValue.current } : undefined),
  }),
}));

jest.mock("@/api/modules/company/modules/appearance/services", () => ({
  hrisCompanyAppearanceService: { getAppearance: () => getAppearance() },
}));

jest.mock("@/api/modules/companyAddress", () => ({
  currentCompanySubdomain: async () => subdomain.current,
  publicAppearanceFor: (s: string) => publicAppearanceFor(s),
}));

import { workspaceAccent } from "./workspaceAccent";

describe("workspaceAccent", () => {
  beforeEach(() => {
    cookieValue.current = undefined;
    subdomain.current = null;
    getAppearance.mockReset();
    publicAppearanceFor.mockReset();
  });

  it("answers the default and asks nothing on the root without a session", async () => {
    expect(await workspaceAccent()).toBeNull();
    expect(getAppearance).not.toHaveBeenCalled();
    expect(publicAppearanceFor).not.toHaveBeenCalled();
  });

  it("answers the company's accent with a session", async () => {
    cookieValue.current = "token";
    getAppearance.mockResolvedValue({ accent: "denim" });

    expect(await workspaceAccent()).toBe("denim");
  });

  it("answers the default when the appearance request fails on the root", async () => {
    cookieValue.current = "token";
    getAppearance.mockRejectedValue(new Error("backend down"));

    await expect(workspaceAccent()).resolves.toBeNull();
  });

  it("paints a company's own login page in its colour before anybody signs in", async () => {
    subdomain.current = "acme";
    publicAppearanceFor.mockResolvedValue({ accent: "#2563eb" });

    expect(await workspaceAccent()).toBe("#2563eb");
    expect(publicAppearanceFor).toHaveBeenCalledWith("acme");
    expect(getAppearance).not.toHaveBeenCalled();
  });

  it("answers the default on the login page of a company that chose no colour", async () => {
    subdomain.current = "acme";
    publicAppearanceFor.mockResolvedValue({ accent: null });

    expect(await workspaceAccent()).toBeNull();
  });
});
