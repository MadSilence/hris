jest.mock("next/headers", () => ({
  cookies: async () => ({ get: () => undefined }),
  headers: async () => new Map(),
}));

import { callerHeaders } from "@/api/clients/hrisApiClient/hrisApiClient";

const incoming = (values: Record<string, string>) => ({
  get: (name: string) => values[name] ?? null,
});

describe("callerHeaders", () => {
  it("carries the browser's address chain and user agent to the backend", () => {
    expect(callerHeaders(incoming({
      "x-forwarded-for": "203.0.113.7, 10.0.0.2",
      "user-agent": "Mozilla/5.0",
    }))).toEqual({
      "X-Forwarded-For": "203.0.113.7, 10.0.0.2",
      "User-Agent": "Mozilla/5.0",
    });
  });

  it("sends nothing it does not have — outside a request there is nobody to speak for", () => {
    expect(callerHeaders(null)).toEqual({});
    expect(callerHeaders(incoming({}))).toEqual({});
  });
});
