import { useEffect } from "react";

/**
 * Ctrl + K, or Cmd + K on a Mac, from anywhere in the app shell — including from inside a text field,
 * which is where a reader usually is when they think of looking something up. The browser's own use of
 * the chord (focus the address bar's search) is pre-empted only while the shell is on screen.
 */
export const useQuickSearchShortcut = (onOpen: () => void) => {
  useEffect(() => {
    const handle = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && !event.altKey && !event.shiftKey && event.key.toLowerCase() === "k") {
        event.preventDefault();
        onOpen();
      }
    };
    window.addEventListener("keydown", handle);
    return () => window.removeEventListener("keydown", handle);
  }, [onOpen]);
};
