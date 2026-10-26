/**
 * The canvas's keys (research § B.3, "Keyboard"). A block is moved a day or a lane at a time — React
 * Flow's own arrow keys move it by pixels, which means nothing on a timeline, so they are switched off
 * and these take their place. Every key here has a field in the side panel as well (WCAG 2.5.7).
 */

export type CanvasCommand =
  | { type: "shiftDays"; days: number }
  | { type: "shiftLane"; lanes: number }
  | { type: "remove" }
  | { type: "openPanel" }
  | { type: "deselect" }
  | { type: "fit" };

type KeyLike = Pick<KeyboardEvent, "key" | "code" | "altKey" | "shiftKey" | "metaKey" | "ctrlKey">;

/**
 * What a key press means. `hasSelection`: a block or an arrow is selected — the moves need a block, which
 * the caller checks; Alt/Option+1 fits whatever is selected.
 */
export const keyToCommand = (event: KeyLike, hasSelection: boolean): CanvasCommand | null => {
  // Alt/Option+1 — the "fit" of Zapier and Miro. `code`, because Option+1 on a Mac types "¡".
  if (event.altKey && (event.code === "Digit1" || event.key === "1")) return { type: "fit" };
  if (event.metaKey || event.ctrlKey || event.altKey) return null;
  if (!hasSelection) return null;
  switch (event.key) {
    case "ArrowLeft": return { type: "shiftDays", days: event.shiftKey ? -7 : -1 };
    case "ArrowRight": return { type: "shiftDays", days: event.shiftKey ? 7 : 1 };
    case "ArrowUp": return { type: "shiftLane", lanes: -1 };
    case "ArrowDown": return { type: "shiftLane", lanes: 1 };
    case "Delete":
    case "Backspace": return { type: "remove" };
    case "Enter": return { type: "openPanel" };
    case "Escape": return { type: "deselect" };
    default: return null;
  }
};

/** Keys typed into a field are the field's, not the canvas's. */
export const isTypingTarget = (target: EventTarget | null): boolean => {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || target.isContentEditable;
};
