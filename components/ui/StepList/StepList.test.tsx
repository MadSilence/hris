import * as React from "react";
import { render, screen } from "@testing-library/react";

import { StepList, type StepListStep } from "./StepList";

const person = (key: string, status?: string): StepListStep["people"][number] => ({
  key,
  avatar: <span />,
  name: key,
  status,
});

/** Done is a tick, not a colour (7-product-wide/STEPS.md). */
describe("StepList", () => {
  it("numbers the steps still ahead, ticks the done one, and puts the now step's name in the accent", () => {
    const { container } = render(
      <StepList
        label="Who approves"
        summary="1 of 3 approved"
        steps={[
          { key: "a", state: "done", people: [person("Meryem", "Manager · Approved Fri 20 Nov")] },
          { key: "b", state: "now", people: [person("You", "Head of people · Waiting for you")] },
          { key: "c", state: "next", people: [person("Tomas")] },
        ]}
      />,
    );
    expect(screen.getByText("Who approves")).toBeInTheDocument();
    expect(screen.getByText("1 of 3 approved")).toBeInTheDocument();
    const marks = [...container.querySelectorAll("ol > li > span:nth-of-type(2), ol > li > span:first-child")].map((m) => m.textContent);
    expect(marks.filter(Boolean)).toEqual(["2", "3"]);
    expect(screen.getByText("You")).toHaveClass("text-accent-text");
    expect(screen.getByText("Tomas")).toHaveClass("text-primary");
  });

  it("keeps a step's own number, and draws no numbers in an unordered list", () => {
    const { rerender } = render(
      <StepList label="Next to sign" steps={[{ key: "x", number: 3, state: "next", people: [person("Lena")] }]} />,
    );
    expect(screen.getByText("3")).toBeInTheDocument();
    rerender(<StepList label="Who approves" ordered={false} steps={[{ key: "x", state: "now", people: [person("Lena")] }]} />);
    expect(screen.queryByText("1")).not.toBeInTheDocument();
  });
});
