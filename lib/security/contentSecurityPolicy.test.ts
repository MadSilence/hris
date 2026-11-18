import { webcrypto } from "node:crypto";

import { contentSecurityPolicy, createNonce } from "./contentSecurityPolicy";

const directive = (policy: string, name: string): string[] =>
  policy
    .split("; ")
    .find((part) => part.startsWith(`${name} `))
    ?.split(" ")
    .slice(1) ?? [];

describe("contentSecurityPolicy", () => {
  it("lets only scripts with this request's nonce run, and what they load", () => {
    const policy = contentSecurityPolicy("abc123", "production");

    expect(directive(policy, "script-src")).toEqual(["'self'", "'nonce-abc123'", "'strict-dynamic'"]);
  });

  it("never allows inline or evaluated scripts in production", () => {
    const policy = contentSecurityPolicy("abc123", "production");

    expect(directive(policy, "script-src")).not.toContain("'unsafe-inline'");
    expect(directive(policy, "script-src")).not.toContain("'unsafe-eval'");
  });

  it("allows eval only in development, for React's refresh", () => {
    expect(directive(contentSecurityPolicy("n", "development"), "script-src")).toContain("'unsafe-eval'");
  });

  it("keeps the page out of frames and plugins", () => {
    const policy = contentSecurityPolicy("n", "production");

    expect(directive(policy, "frame-ancestors")).toEqual(["'none'"]);
    expect(directive(policy, "object-src")).toEqual(["'none'"]);
    expect(directive(policy, "base-uri")).toEqual(["'self'"]);
  });

  it("talks only to its own host in production, and may read back its own blobs (PdfViewer)", () => {
    expect(directive(contentSecurityPolicy("n", "production"), "connect-src")).toEqual(["'self'", "blob:"]);
  });

  it("does not restrict form targets, so a provider's sign-in redirect still works", () => {
    expect(directive(contentSecurityPolicy("n", "production"), "form-action")).toEqual([]);
  });
});

describe("createNonce", () => {
  beforeAll(() => {
    if (!globalThis.crypto?.getRandomValues) {
      Object.defineProperty(globalThis, "crypto", { value: webcrypto });
    }
  });

  it("is 128 bits of base64 and different every time", () => {
    const first = createNonce();
    const second = createNonce();

    expect(first).toMatch(/^[A-Za-z0-9+/]{22}==$/);
    expect(first).not.toEqual(second);
  });
});
