import { act, render } from "@testing-library/react";
import React from "react";
import { useLastHeight } from "./useLastHeight";

// WALK_QUESTIONS § 52: the bar's slot keeps the toolbar's height after the toolbar gives way to the bar.
const Harness: React.FC<{ showToolbar: boolean }> = ({ showToolbar }) => {
  const [ref, height] = useLastHeight();
  return (
    <div>
      {showToolbar ? <div ref={ref} data-test="toolbar" /> : null}
      <span data-test="height">{height ?? "none"}</span>
    </div>
  );
};

describe("useLastHeight", () => {
  let rect: jest.SpyInstance;
  beforeEach(() => {
    rect = jest.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue({ height: 100 } as DOMRect);
  });
  afterEach(() => rect.mockRestore());

  it("keeps the toolbar's last height after it unmounts", () => {
    const view = render(<Harness showToolbar />);
    expect(view.getByTestId("height").textContent).toBe("100");
    act(() => view.rerender(<Harness showToolbar={false} />));
    expect(view.getByTestId("height").textContent).toBe("100");
  });
});
