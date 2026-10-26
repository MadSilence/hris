/**
 * Canvas or List — remembered per viewer, in this browser only. A convenience, so storage that is blocked
 * or empty (a private window, cleared site data) simply means the default.
 */
export type EditorView = "canvas" | "list";

const STORAGE_KEY = "hris.lifecycleTemplateEditor.view";

export const readViewPreference = (): EditorView => {
  try {
    return window.localStorage.getItem(STORAGE_KEY) === "list" ? "list" : "canvas";
  } catch {
    return "canvas";
  }
};

export const writeViewPreference = (view: EditorView) => {
  try {
    window.localStorage.setItem(STORAGE_KEY, view);
  } catch {
    // Not remembered; the choice still holds for this visit.
  }
};

/**
 * The view actually shown. Narrower than `md` there is only the list: the canvas is an editor for a
 * desktop, and a pinch-zoomed timeline on a phone is not offered (research § B.5).
 */
export const effectiveView = (preferred: EditorView, narrow: boolean): EditorView => (narrow ? "list" : preferred);
