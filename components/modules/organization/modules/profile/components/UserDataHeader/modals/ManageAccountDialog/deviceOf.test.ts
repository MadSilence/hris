import { deviceOf } from "./deviceOf";

describe("deviceOf", () => {
  it("reads the device and the browser", () => {
    expect(deviceOf("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Safari/537.36"))
      .toEqual({ device: "Mac", browser: "Chrome" });
    expect(deviceOf("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Safari/537.36 Edg/131.0"))
      .toEqual({ device: "Windows", browser: "Edge" });
    expect(deviceOf("Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1"))
      .toEqual({ device: "iPhone", browser: "Safari" });
  });

  it("says nothing it does not know", () => {
    expect(deviceOf(null)).toEqual({ device: null, browser: null });
    expect(deviceOf("curl/8.0")).toEqual({ device: null, browser: null });
  });
});
