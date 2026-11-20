import type * as React from "react";

/** How long the thumb stays after the list stops (FORMS_AND_FIELDS § 7: shown while the list moves). */
export const THUMB_LINGER_MS = 600;

/**
 * Marks a `scroll-thumb` list as moving (`data-scrolling`, `styles/globals.css`), and unmarks it once it has been
 * still for a moment — the run history's 4 px thumb (`automations-run-history` § Values).
 */
export const showThumbWhileScrolling = (event: React.UIEvent<HTMLElement>) => {
  const list = event.currentTarget;
  list.dataset.scrolling = "";
  window.clearTimeout(Number(list.dataset.thumbTimer));
  list.dataset.thumbTimer = String(
    window.setTimeout(() => {
      delete list.dataset.scrolling;
    }, THUMB_LINGER_MS),
  );
};
