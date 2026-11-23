import { passedResponseHeaders, upstreamRequest, uploadPath } from "./uploadProxy";

const headers = (values: Record<string, string>) => ({
  get: (name: string): string | null => values[name.toLowerCase()] ?? null,
});

describe("uploadPath", () => {
  it("encodes each segment and keeps the slashes", () => {
    expect(uploadPath(["company", "logo", "a b.png"])).toBe("/uploads/company/logo/a%20b.png");
  });
});

// R3 (2026-11-23): every company host serves /uploads, passed to the backend.
describe("upstreamRequest", () => {
  it("asks the backend for the same path, and carries the browser's revalidation", () => {
    const upstream = upstreamRequest(headers({ "if-none-match": "\"v1\"", cookie: "s=1" }), ["c", "logo.png"],
      "http://backend:8081/");

    expect(upstream?.url).toBe("http://backend:8081/uploads/c/logo.png");
    expect(upstream?.headers).toEqual({ "if-none-match": "\"v1\"" });
  });

  it("asks nothing without a backend or a path", () => {
    expect(upstreamRequest(headers({}), ["x.png"], undefined)).toBeNull();
    expect(upstreamRequest(headers({}), [], "http://backend:8081")).toBeNull();
  });
});

describe("passedResponseHeaders", () => {
  it("passes the file's type and caching, the backend's sandbox, and never a cookie", () => {
    expect(passedResponseHeaders(headers({
      "content-type": "image/png",
      "cache-control": "public, max-age=3600",
      etag: "\"v1\"",
      "content-security-policy": "sandbox",
      "set-cookie": "never=travels",
    }))).toEqual({
      "content-type": "image/png",
      "cache-control": "public, max-age=3600",
      etag: "\"v1\"",
      "content-security-policy": "sandbox",
    });
  });
});
