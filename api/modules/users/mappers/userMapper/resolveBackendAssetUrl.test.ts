describe("resolveBackendAssetUrl", () => {
  // The module reads BACKEND_URL when it loads, so each test loads it afresh with the variable set.
  const load = async () => {
    jest.resetModules();
    process.env.BACKEND_URL = "http://backend:8081";
    return (await import("./resolveBackendAssetUrl")).resolveBackendAssetUrl;
  };

  it("points an upload at the backend", async () => {
    expect((await load())("/uploads/a/b.png")).toBe("http://backend:8081/uploads/a/b.png");
  });

  it("leaves the web app's own files on this origin", async () => {
    expect((await load())("/sample-avatars/f-04.webp")).toBe("/sample-avatars/f-04.webp");
  });

  it("leaves an absolute URL alone", async () => {
    expect((await load())("https://cdn.example.com/x.png")).toBe("https://cdn.example.com/x.png");
  });

  it("answers null for nothing", async () => {
    expect((await load())(null)).toBeNull();
  });
});
