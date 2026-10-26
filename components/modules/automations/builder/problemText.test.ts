import { problemText } from "./PreviewPanel";

describe("problemText", () => {
  // Found in the live walk of 2026-10-17: the validator's bare detail left the template's {0} raw.
  it("fills the template from a bare detail", () => {
    expect(problemText({ path: "actions", code: "AU00004", message: "add at least one action" })).toBe(
      "One of the actions is not finished yet: add at least one action.",
    );
  });

  it("still cuts a message shaped 'text: detail' at the colon", () => {
    expect(problemText({ path: "actions", code: "AU00004", message: "An action is incomplete: write a subject" })).toBe(
      "One of the actions is not finished yet: write a subject.",
    );
  });
});
