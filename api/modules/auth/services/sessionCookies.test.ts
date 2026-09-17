import type { NextResponse } from "next/server";

import { setSessionCookies } from "@/api/modules/auth/services/sessionCookies";
import { readRememberedCompany, rememberCompany } from "@/api/modules/companyAddress";

type CookieOptions = { name: string; domain?: string; value: string; httpOnly?: boolean };

const responseCapturingCookies = () => {
  const written: CookieOptions[] = [];
  const res = { cookies: { set: (options: CookieOptions) => written.push(options) } } as unknown as NextResponse;
  return { res, written };
};

describe("session cookies", () => {
  /*
    A session belongs to the host it was signed in at. With no `Domain`, a cookie set on `acme.<root>`
    is never sent to `globex.<root>` — which is the isolation between companies' sessions in the browser.
    A `Domain` on any of these would hand one company's session to every other company's address.
  */
  it("stay on the host they were set at: no Domain on any of the three", () => {
    const { res, written } = responseCapturingCookies();

    setSessionCookies(res, { accessToken: "access", refreshToken: "refresh" });

    expect(written.map((c) => c.name).sort()).toEqual(["access_token", "has_session", "refresh_token"]);
    written.forEach((cookie) => expect(cookie.domain).toBeUndefined());
  });

  it("remember the company on the parent domain, because the root is the one that reads it", () => {
    const { res, written } = responseCapturingCookies();

    rememberCompany(res, "acme");

    expect(written).toHaveLength(1);
    expect(written[0]).toMatchObject({ name: "last_company", value: "acme", domain: "localhost", httpOnly: true });
  });

  it("offer back the address that signed in before the one merely typed, and nothing that is not an address", () => {
    expect(readRememberedCompany("acme", "globex")).toBe("acme");
    expect(readRememberedCompany(undefined, "globex")).toBe("globex");
    expect(readRememberedCompany("Not An Address", undefined)).toBeNull();
    expect(readRememberedCompany(undefined, undefined)).toBeNull();
  });
});
