import { resolveBackendAssetUrl } from "./resolveBackendAssetUrl";

describe("resolveBackendAssetUrl", () => {
  // R3 (2026-11-23): every company host serves /uploads itself, so an upload is never written with the backend's address.
  it("keeps an upload relative, even with BACKEND_URL set", () => {
    process.env.BACKEND_URL = "http://backend:8081";
    expect(resolveBackendAssetUrl("/uploads/a/b.png")).toBe("/uploads/a/b.png");
    expect(resolveBackendAssetUrl("uploads/a/b.png")).toBe("/uploads/a/b.png");
  });

  it("leaves the web app's own files on this origin", () => {
    expect(resolveBackendAssetUrl("/sample-avatars/f-04.webp")).toBe("/sample-avatars/f-04.webp");
  });

  it("leaves an absolute URL alone", () => {
    expect(resolveBackendAssetUrl("https://cdn.example.com/x.png")).toBe("https://cdn.example.com/x.png");
  });

  it("answers null for nothing", () => {
    expect(resolveBackendAssetUrl(null)).toBeNull();
  });
});
