/**
 * Who sees what, open or collapsed (J8) — one choice that holds for every step, remembered in this browser only. A
 * convenience, so storage that is blocked or empty simply means open.
 */
const STORAGE_KEY = "hris.automationEditor.whoSeesWhatCollapsed";

export const readWhoSeesWhatCollapsed = (): boolean => {
  try {
    return window.localStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
};

export const writeWhoSeesWhatCollapsed = (collapsed: boolean) => {
  try {
    window.localStorage.setItem(STORAGE_KEY, collapsed ? "1" : "0");
  } catch {
    // Not remembered; the choice still holds for this visit.
  }
};
