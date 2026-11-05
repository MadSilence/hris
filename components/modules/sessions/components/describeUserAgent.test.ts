import { translatorFor } from "@/test/nextIntl";
import { describeUserAgent as describe_ } from "./describeUserAgent";

const t = translatorFor("auth") as unknown as Parameters<typeof describe_>[1];
const describeUserAgent = (ua: string | null) => describe_(ua, t);

describe("describeUserAgent", () => {
  it("names the browser before the engine it borrows", () => {
    expect(
      describeUserAgent(
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36 Edg/130.0",
      ),
    ).toBe("Edge on Windows");
    expect(
      describeUserAgent("Mozilla/5.0 (Macintosh; Intel Mac OS X 14_5) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Safari/605.1.15"),
    ).toBe("Safari on macOS");
    expect(describeUserAgent("Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) Safari/604.1")).toBe("Safari on iOS");
  });

  it("says so when there is nothing to read", () => {
    expect(describeUserAgent(null)).toBe("Unknown browser");
  });
});
