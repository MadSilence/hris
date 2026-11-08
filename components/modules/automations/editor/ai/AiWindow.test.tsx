import * as React from "react";
import { render } from "@testing-library/react";
import { AiWindow } from "./AiWindow";

describe("AiWindow", () => {
  const original = Element.prototype.scrollIntoView;
  afterEach(() => {
    Element.prototype.scrollIntoView = original;
  });

  it("opens and closes when scrollIntoView returns a Promise, as Chromium's now does", () => {
    // Found in the walk of 2026-11-07: the effect handed the Promise back to React as its clean-up, and closing or
    // re-rendering the window broke the whole page with "destroy is not a function".
    Element.prototype.scrollIntoView = jest.fn(() => Promise.resolve()) as unknown as typeof original;
    const props = { value: "", busy: false, onChange: jest.fn(), onSubmit: jest.fn(), onUndo: jest.fn() };
    const { rerender, unmount } = render(<AiWindow turns={[]} {...props} />);
    rerender(<AiWindow turns={[{ id: 1, prompt: "Tell HR", reply: { kind: "notConnected" } }]} {...props} />);
    expect(() => unmount()).not.toThrow();
  });
});
