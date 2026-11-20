import { render, screen } from "@testing-library/react";
import { StarIcon } from "@hugeicons/core-free-icons";
import { SelectionBar } from "./SelectionBar";

describe("SelectionBar", () => {
  // WALK_QUESTIONS § 50: the bar takes the place of a 48 px row in a `flex flex-col gap-6` list. A zero-height marker
  // rendered beside it was a second flex item and added a 24 px gap, so the rows moved under the pointer at the first
  // tick and the next click missed its checkbox.
  it("adds exactly one element to its parent, so a flex gap does not grow when it appears", () => {
    const { container } = render(
      <SelectionBar count={1} onClear={() => undefined} actions={[{ key: "star", label: "Star", icon: StarIcon, onClick: () => undefined }]} />,
    );
    expect(container.childElementCount).toBe(1);
    expect(container.firstElementChild).toBe(screen.getByRole("region"));
  });
});
