import { render, screen } from "@testing-library/react";

import { DraftsToggle } from "./DraftsToggle";

describe("DraftsToggle", () => {
  it("is absent when there is nothing to show", () => {
    const { container } = render(<DraftsToggle count={0} showingDrafts={false} onChange={jest.fn()} />);

    // A control that can only open an empty list is not drawn at all — the rule the archived
    // segment already follows, and the reason the prop is a count rather than a boolean.
    expect(container).toBeEmptyDOMElement();
  });

  it("names the number so the reader knows what they are opening", () => {
    render(<DraftsToggle count={3} showingDrafts={false} onChange={jest.fn()} />);

    expect(screen.getByRole("button", { name: /drafts \(3\)/i })).toBeInTheDocument();
  });

  it("leaves the drafts view when the last draft goes", () => {
    const onChange = jest.fn();
    render(<DraftsToggle count={0} showingDrafts onChange={onChange} />);

    // Inviting the last draft while the segment is open would otherwise leave an empty list with
    // the only way back out of it gone.
    expect(onChange).toHaveBeenCalledWith(false);
  });
});
