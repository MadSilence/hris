/**
 * The one distinction this service has to keep: a bad token versus an unreadable key source.
 *
 * Merging them is not a cosmetic bug — the BFF answers 401, the API client reads that 401 as a dead
 * session, and a backend outage logs everyone out. The smoke run of 2026-08-28 found exactly that,
 * with `withAuthMiddleware` already written to tell the two apart and never getting the chance.
 */
const getSigningKey = jest.fn();

jest.mock("next/headers", () => ({
  cookies: async () => ({ get: () => ({ value: "header.payload.signature" }) }),
  headers: async () => ({ get: () => null }),
}));

jest.mock("@/api/clients/auth/jwksClient/jwksClient", () => ({
  jwksClient: { getSigningKey: (kid: string) => getSigningKey(kid) },
}));

jest.mock("jsonwebtoken", () => ({
  ...jest.requireActual("jsonwebtoken"),
  decode: () => ({ header: { kid: "k1" }, payload: {}, signature: "" }),
  verify: () => ({ sub: "user-1" }),
}));

import { jwtService } from "./jwtService";
import { UnauthorizedError } from "./unauthorizedError";
import { SigningKeyUnavailableError } from "./signingKeyUnavailableError";

/** jwks-rsa's own error is a plain function-style class; only `name` identifies it. */
function signingKeyNotFound() {
  const e = new Error("Unable to find a signing key that matches 'k1'");
  e.name = "SigningKeyNotFoundError";
  return e;
}

/** What `fetch` throws when nothing is listening on the backend port. */
function connectionRefused() {
  return new TypeError("fetch failed", { cause: new Error("ECONNREFUSED") });
}

describe("JwtService.verifyToken", () => {
  beforeEach(() => getSigningKey.mockReset());

  it("verifies the token when the signing key is readable", async () => {
    getSigningKey.mockResolvedValue({ getPublicKey: () => "public-key" });

    await expect(jwtService.verifyToken()).resolves.toEqual({ sub: "user-1" });
  });

  it("keeps an unreachable JWKS endpoint out of the 401 bucket", async () => {
    getSigningKey.mockRejectedValue(connectionRefused());

    const error = await jwtService.verifyToken().catch((e) => e);

    expect(error).toBeInstanceOf(SigningKeyUnavailableError);
    expect(error).not.toBeInstanceOf(UnauthorizedError);
  });

  it("still calls a kid the JWKS does not know a token problem", async () => {
    getSigningKey.mockRejectedValue(signingKeyNotFound());

    await expect(jwtService.verifyToken()).rejects.toBeInstanceOf(UnauthorizedError);
  });
});
