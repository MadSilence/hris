import { keyToCommand } from "./keyboard";
import { effectiveView, readViewPreference, writeViewPreference } from "./viewPreference";

const key = (k: string, over: Partial<Record<"code" | "altKey" | "shiftKey" | "metaKey" | "ctrlKey", string | boolean>> = {}) => ({
  key: k, code: "", altKey: false, shiftKey: false, metaKey: false, ctrlKey: false, ...over,
}) as Parameters<typeof keyToCommand>[0];

describe("the canvas's keys", () => {
  it("moves the selected block a day, a week with Shift, and a lane up or down", () => {
    expect(keyToCommand(key("ArrowRight"), true)).toEqual({ type: "shiftDays", days: 1 });
    expect(keyToCommand(key("ArrowLeft"), true)).toEqual({ type: "shiftDays", days: -1 });
    expect(keyToCommand(key("ArrowRight", { shiftKey: true }), true)).toEqual({ type: "shiftDays", days: 7 });
    expect(keyToCommand(key("ArrowDown"), true)).toEqual({ type: "shiftLane", lanes: 1 });
    expect(keyToCommand(key("ArrowUp"), true)).toEqual({ type: "shiftLane", lanes: -1 });
  });

  it("removes with Delete, opens the panel with Enter, lets go with Escape", () => {
    expect(keyToCommand(key("Delete"), true)).toEqual({ type: "remove" });
    expect(keyToCommand(key("Backspace"), true)).toEqual({ type: "remove" });
    expect(keyToCommand(key("Enter"), true)).toEqual({ type: "openPanel" });
    expect(keyToCommand(key("Escape"), true)).toEqual({ type: "deselect" });
  });

  it("fits with Alt/Option+1 — read from the key's place, since Option+1 types ¡ on a Mac", () => {
    expect(keyToCommand(key("¡", { altKey: true, code: "Digit1" }), false)).toEqual({ type: "fit" });
    expect(keyToCommand(key("1", { altKey: true }), false)).toEqual({ type: "fit" });
  });

  it("does nothing without a selection, or with a modifier the canvas does not use", () => {
    expect(keyToCommand(key("ArrowRight"), false)).toBeNull();
    expect(keyToCommand(key("ArrowRight", { metaKey: true }), true)).toBeNull();
    expect(keyToCommand(key("a"), true)).toBeNull();
  });
});

describe("Canvas or List", () => {
  afterEach(() => jest.restoreAllMocks());

  it("is only the list below md", () => {
    expect(effectiveView("canvas", true)).toBe("list");
    expect(effectiveView("canvas", false)).toBe("canvas");
    expect(effectiveView("list", false)).toBe("list");
  });

  it("is remembered in this browser, and storage that refuses means the default", () => {
    writeViewPreference("list");
    expect(readViewPreference()).toBe("list");
    jest.spyOn(Storage.prototype, "getItem").mockImplementation(() => { throw new Error("blocked"); });
    jest.spyOn(Storage.prototype, "setItem").mockImplementation(() => { throw new Error("blocked"); });
    expect(readViewPreference()).toBe("canvas");
    expect(() => writeViewPreference("canvas")).not.toThrow();
  });
});
