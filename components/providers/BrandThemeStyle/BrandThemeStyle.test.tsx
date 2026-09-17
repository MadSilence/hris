/**
 * `BrandThemeStyle` fails silently on purpose — a theme is never worth an error screen — which is
 * exactly the kind of behaviour nobody notices breaking. These pin the gates: no session and no company
 * means no request at all, a failing backend means the shipped palette, not a thrown render — and a
 * company's own address wears its colour before anybody signs in.
 */
import type { ReactElement } from "react";

const cookieValue: { current: string | undefined } = { current: undefined };
const subdomain: { current: string | null } = { current: null };
const getAppearance = jest.fn();
const publicAppearanceFor = jest.fn();

jest.mock("next/headers", () => ({
  cookies: async () => ({
    get: (name: string) => (name === "access_token" && cookieValue.current ? { value: cookieValue.current } : undefined),
  }),
}));

jest.mock("@/api/modules/company/modules/appearance/services", () => ({
  hrisCompanyAppearanceService: { getAppearance: () => getAppearance() },
}));

jest.mock("@/api/modules/companyAddress", () => ({
  currentCompanySubdomain: async () => subdomain.current,
  publicAppearanceFor: (s: string) => publicAppearanceFor(s),
}));

import BrandThemeStyle from "./BrandThemeStyle";

// An async server component is a plain async function: calling it returns the element it renders.
const render = async (): Promise<ReactElement | null> =>
  (await (BrandThemeStyle as unknown as () => Promise<ReactElement | null>)()) ?? null;

const styleOf = (element: ReactElement | null): string =>
  (element!.props as { dangerouslySetInnerHTML: { __html: string } }).dangerouslySetInnerHTML.__html;

describe("BrandThemeStyle", () => {
  beforeEach(() => {
    cookieValue.current = undefined;
    subdomain.current = null;
    getAppearance.mockReset();
    publicAppearanceFor.mockReset();
  });

  it("renders nothing and asks nothing on the root without a session", async () => {
    expect(await render()).toBeNull();
    expect(getAppearance).not.toHaveBeenCalled();
    expect(publicAppearanceFor).not.toHaveBeenCalled();
  });

  it("keeps the shipped palette when the appearance request fails", async () => {
    cookieValue.current = "token";
    getAppearance.mockRejectedValue(new Error("backend down"));

    await expect(render()).resolves.toBeNull();
  });

  it("keeps the shipped palette for a company with no brand colour and no contrast sidebar", async () => {
    cookieValue.current = "token";
    subdomain.current = "acme";
    getAppearance.mockResolvedValue({ brandColor: null, sidebarContrast: false });

    expect(await render()).toBeNull();
    expect(publicAppearanceFor).not.toHaveBeenCalled();
  });

  it("paints the brand before the first frame for a branded company", async () => {
    cookieValue.current = "token";
    getAppearance.mockResolvedValue({ brandColor: "#2563eb", sidebarContrast: false });

    const element = await render();
    expect(element).not.toBeNull();
    expect(styleOf(element)).toContain("html:root{--brown-50:");
    expect(styleOf(element)).toContain("--brown-600:#2563eb");
  });

  it("paints a company's own login page in its colour before anybody signs in", async () => {
    subdomain.current = "acme";
    publicAppearanceFor.mockResolvedValue({ brandColor: "#2563eb" });

    const element = await render();

    expect(publicAppearanceFor).toHaveBeenCalledWith("acme");
    expect(styleOf(element)).toContain("--brown-600:#2563eb");
    expect(getAppearance).not.toHaveBeenCalled();
  });

  it("keeps the shipped palette on the login page of a company that chose no colour", async () => {
    subdomain.current = "acme";
    publicAppearanceFor.mockResolvedValue({ brandColor: null });

    expect(await render()).toBeNull();
  });
});
