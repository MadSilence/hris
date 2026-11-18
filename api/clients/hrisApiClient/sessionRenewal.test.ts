/**
 * B1 (2026-11-18): a call that meets an expired access token renews it with the refresh cookie, writes the new
 * cookies, and is made once more — where cookies can be written. Where they cannot (a server component), nothing is
 * traded: the refresh token the browser holds must not be spent behind its back.
 */
const jar = new Map<string, string>();
let writable = true;
const setCalls: { name: string; value: string }[] = [];

jest.mock("next/headers", () => ({
  cookies: async () => ({
    get: (name: string) => (jar.has(name) ? { value: jar.get(name) } : undefined),
    set: (c: { name: string; value: string }) => {
      if (!writable) throw new Error("Cookies can only be modified in a Server Action or Route Handler");
      setCalls.push({ name: c.name, value: c.value });
      jar.set(c.name, c.value);
    },
  }),
  headers: async () => new Map(),
}));

import { hrisApiClient } from "@/api/clients/hrisApiClient/hrisApiClient";
import { ACCESS_COOKIE, REFRESH_COOKIE } from "@/config/security/sessionCookieNames";

/** Just what the client reads of a `Response` — jsdom has none, and the shared setup needs jsdom. */
type FakeResponse = { status: number; ok: boolean; headers: { get(n: string): string | null }; json(): Promise<unknown>; text(): Promise<string>; clone(): FakeResponse };
const json = (status: number, body: unknown, extra: Record<string, string> = {}): FakeResponse => {
  const all: Record<string, string> = { "content-type": "application/json", ...extra };
  const make = (): FakeResponse => ({
    status,
    ok: status >= 200 && status < 300,
    headers: { get: (n: string) => all[n.toLowerCase()] ?? null },
    json: async () => body,
    text: async () => JSON.stringify(body),
    clone: make,
  });
  return make();
};

describe("renewing an expired access token inside a server call", () => {
  const fetchMock = jest.fn();

  beforeEach(() => {
    jar.clear();
    setCalls.length = 0;
    writable = true;
    jar.set(ACCESS_COOKIE, "old-access");
    jar.set(REFRESH_COOKIE, "refresh-1");
    fetchMock.mockReset();
    global.fetch = fetchMock as unknown as typeof fetch;
  });

  it("renews, writes the new cookies and makes the call once more", async () => {
    fetchMock
      .mockResolvedValueOnce(json(401, { code: "TOKEN_INVALID" }))
      .mockResolvedValueOnce(json(200, { accessToken: "new-access" }, { "set-cookie": `${REFRESH_COOKIE}=refresh-2; Path=/; HttpOnly` }))
      .mockResolvedValueOnce(json(200, { id: "env-1" }));

    await expect(hrisApiClient.post<{ id: string }>("/documents/envelopes/env-1/cancel", { reason: null })).resolves.toEqual({ id: "env-1" });

    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(String(fetchMock.mock.calls[1][0])).toMatch(/\/auth\/refresh$/);
    const retried = new Headers(fetchMock.mock.calls[2][1].headers);
    expect(retried.get("Authorization")).toBe("Bearer new-access");
    expect(jar.get(ACCESS_COOKIE)).toBe("new-access");
    expect(jar.get(REFRESH_COOKIE)).toBe("refresh-2");
  });

  it("where cookies cannot be written, trades nothing and answers the 401", async () => {
    writable = false;
    fetchMock.mockResolvedValueOnce(json(401, { code: "TOKEN_INVALID" }));

    await expect(hrisApiClient.get("/users/me")).rejects.toMatchObject({ status: 401 });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(jar.get(REFRESH_COOKIE)).toBe("refresh-1");
  });

  it("another 401 — not an expired token — is not retried", async () => {
    fetchMock.mockResolvedValueOnce(json(401, { code: "SESSION_REVOKED" }));

    await expect(hrisApiClient.get("/users/me")).rejects.toMatchObject({ status: 401 });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
