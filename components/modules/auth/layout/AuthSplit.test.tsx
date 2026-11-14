import { render } from "@testing-library/react";

import { AuthSplit } from "./AuthSplit";

/** The logo's colours, written as jsdom reads them back (a component file carries no raw HEX). */
const CHERRY = "rgb(190, 18, 60)";
const SUNFLOWER = "rgb(245, 197, 24)";

const hotStrokes = (container: HTMLElement) =>
  [...container.querySelectorAll(".auth-pane circle.hot")].map((circle) => (circle as SVGElement).style.stroke);

describe("the login's pane in the company's background (sign-in-appearance § Light)", () => {
  it("is the company's colour unless the company chose Light", () => {
    const { container } = render(<AuthSplit brand={{ kind: "company", name: "Acme" }}>form</AuthSplit>);

    expect(container.querySelector(".auth-split")).toHaveAttribute("data-background", "color");
    expect(hotStrokes(container).every((stroke) => stroke === "")).toBe(true);
  });

  it("nods in the logo's colours on a Light pane when the logo has several", () => {
    const { container } = render(
      <AuthSplit brand={{ kind: "company", name: "Acme", background: "LIGHT", logoColors: [CHERRY, SUNFLOWER] }}>form</AuthSplit>,
    );

    expect(container.querySelector(".auth-split")).toHaveAttribute("data-background", "light");
    expect(hotStrokes(container)).toEqual([CHERRY, SUNFLOWER, CHERRY, SUNFLOWER]);
  });

  it("keeps the company colour on a Light pane for a logo of one colour, and noddo's own screens always Wine", () => {
    const light = render(<AuthSplit brand={{ kind: "company", name: "Acme", background: "LIGHT", logoColors: [CHERRY] }}>form</AuthSplit>);
    expect(hotStrokes(light.container).every((stroke) => stroke === "")).toBe(true);

    const noddo = render(<AuthSplit brand={{ kind: "noddo" }}>form</AuthSplit>);
    expect(noddo.container.querySelector(".auth-split")).toHaveAttribute("data-background", "color");
  });
});
