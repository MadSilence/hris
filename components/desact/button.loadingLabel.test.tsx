import { render, screen } from "@testing-library/react";

import { Button } from "./button";

describe("Button loadingLabel", () => {
  it("names the button by its idle label and keeps the saving label laid out but hidden", () => {
    render(<Button type="button" loadingLabel="Saving…">Save</Button>);

    const button = screen.getByRole("button", { name: "Save" });
    const hidden = screen.getByText("Saving…");
    expect(button).toContainElement(hidden);
    expect(hidden).toHaveAttribute("aria-hidden", "true");
    expect(hidden).toHaveClass("invisible");
  });

  it("swaps to the saving label with the ring while loading", () => {
    render(<Button type="button" loading loadingLabel="Saving…">Save</Button>);

    const button = screen.getByRole("button", { name: "Saving…" });
    expect(button).toHaveAttribute("aria-busy", "true");
    expect(screen.getByText("Save")).toHaveClass("invisible");
  });

  it("renders no extra markup without a loading label", () => {
    render(<Button type="button">Save</Button>);

    expect(screen.getByRole("button", { name: "Save" }).children).toHaveLength(0);
  });
});
