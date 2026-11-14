import { backPage, failedPage } from "./providerPaths";

/** Where a refused provider round trip sends the browser (SIGN_IN_IMPLEMENTATION_DESIGN.md § 4.2). */
describe("backPage", () => {
  it.each([
    ["/login", "/login"],
    ["/trial", "/trial"],
    ["/invite?token=abc_-123", "/invite?token=abc_-123"],
    ["/preferences", "/preferences"],
  ])("follows %s", (kept, expected) => {
    expect(backPage(kept)).toBe(expected);
  });

  it.each([
    ["nothing", undefined],
    ["another host", "//evil.example/login"],
    ["a full address", "https://evil.example"],
    ["an invitation with more than a token", "/invite?token=a&next=//evil.example"],
    ["the root of the app", "/"],
  ])("sends %s to the login", (_, kept) => {
    expect(backPage(kept)).toBe("/login");
  });
});

describe("failedPage", () => {
  it("names the provider that failed", () => {
    expect(failedPage("/login", "GOOGLE", false)).toBe("/login?provider=GOOGLE");
  });

  it("keeps an invitation's token and says the account is somebody else's (I9)", () => {
    expect(failedPage("/invite?token=t", "MICROSOFT", true)).toBe("/invite?token=t&provider=MICROSOFT&inUse=1");
  });

  it("names no provider it does not know", () => {
    expect(failedPage("/trial", "APPLE", false)).toBe("/trial");
  });
});
