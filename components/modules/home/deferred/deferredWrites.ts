"use client";

import { useSyncExternalStore } from "react";

/**
 * Home's writes that wait: Approve on *Waiting on you* and ticking a task done on *My tasks* (DECISIONS.md § "The home
 * redesign"). **Undo delays the action** — the write is held for {@link UNDO_WINDOW_MS} and sent when the window
 * closes; Undo drops it, so nothing is journalled, notified or triggered for an undone approval. Leaving the page
 * inside the window sends it at once: a route change unmounts Home, which flushes, and closing the tab fires
 * `pagehide`, which flushes too (a server action started there may still be cut off by the browser — the one gap).
 *
 * <p>Module state on purpose: a write must outlive the widget that started it (the deck moves on, the row leaves), and
 * there is one queue per tab.
 */
export const UNDO_WINDOW_MS = 5000;

type Pending = { key: string; send: () => Promise<void>; timer: ReturnType<typeof setTimeout> };

const pending = new Map<string, Pending>();
/**
 * Sent and not answered yet. Still hidden, so the card does not come back while the write is in flight — in the dev
 * server a navigation that compiles holds a server action back for half a minute, and the deck showed the approved
 * card again meanwhile (walk of 2026-11-11). No longer undoable.
 */
const inFlight = new Set<string>();
const listeners = new Set<() => void>();
let snapshot: ReadonlySet<string> = new Set();

const changed = () => {
  snapshot = new Set([...pending.keys(), ...inFlight]);
  listeners.forEach((listener) => listener());
};

const run = (key: string) => {
  const entry = pending.get(key);
  if (!entry) return;
  clearTimeout(entry.timer);
  pending.delete(key);
  inFlight.add(key);
  changed();
  void entry.send().finally(() => {
    inFlight.delete(key);
    changed();
  });
};

/**
 * Holds `send` for the undo window under `key` (one write per key: a second schedule replaces the first). Returns
 * Undo — true when the write was dropped in time, false when it had already gone.
 */
export const scheduleWrite = (key: string, send: () => Promise<void>, delay = UNDO_WINDOW_MS): (() => boolean) => {
  const previous = pending.get(key);
  if (previous) clearTimeout(previous.timer);
  pending.set(key, { key, send, timer: setTimeout(() => run(key), delay) });
  changed();
  ensurePageHide();
  return () => {
    const entry = pending.get(key);
    if (!entry) return false;
    clearTimeout(entry.timer);
    pending.delete(key);
    changed();
    return true;
  };
};

/** Sends every held write now — Home is being left. */
export const flushWrites = () => {
  [...pending.keys()].forEach(run);
};

let listening = false;
const ensurePageHide = () => {
  if (listening || typeof window === "undefined") return;
  listening = true;
  window.addEventListener("pagehide", flushWrites);
};

/** The keys held right now — a widget hides what is about to be written, so the deck and the list move on at once. */
export const usePendingWrites = (): ReadonlySet<string> =>
  useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    () => snapshot,
    () => snapshot,
  );
