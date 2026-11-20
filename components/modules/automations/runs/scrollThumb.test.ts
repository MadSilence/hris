import type * as React from "react";
import { showThumbWhileScrolling, THUMB_LINGER_MS } from "./scrollThumb";

describe("the run lists' scroll thumb", () => {
  it("is marked while the list moves and unmarked once it has been still", () => {
    jest.useFakeTimers();
    const list = document.createElement("div");
    const scroll = () => showThumbWhileScrolling({ currentTarget: list } as unknown as React.UIEvent<HTMLElement>);
    scroll();
    expect(list.hasAttribute("data-scrolling")).toBe(true);
    jest.advanceTimersByTime(THUMB_LINGER_MS - 100);
    scroll();
    jest.advanceTimersByTime(THUMB_LINGER_MS - 100);
    expect(list.hasAttribute("data-scrolling")).toBe(true);
    jest.advanceTimersByTime(200);
    expect(list.hasAttribute("data-scrolling")).toBe(false);
    jest.useRealTimers();
  });
});
