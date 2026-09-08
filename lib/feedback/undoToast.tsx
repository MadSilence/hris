"use client";

import * as React from "react";
import { toast } from "sonner";
import { Undo2 } from "lucide-react";
import { showError } from "@/lib/errors/errorToast";

/**
 * "Done — undo?", for three seconds, with a bar that drains.
 *
 * Decided 2026-09-02. **A trash and an undo answer different needs**: a trash is asked for after
 * regret, days later, and an undo after a slip — a click on the wrong row, the menu item above the
 * one you meant — which is the case that actually happens. The product has one trash, for documents,
 * and deliberately no others; deactivation covers the rest of the formula. What it had nowhere was
 * the ten seconds after a slip.
 *
 * **It is not a confirmation dialog and must not replace one.** This is for an act that is already
 * reversible — archiving, deactivating, unassigning — where a dialog asking "are you sure" for the
 * fifteenth time buys nothing. An irreversible act still gets its dialog, with its impact counts.
 *
 * The bar is the honest part. A toast that offers an undo without showing how long it has left asks
 * the reader to gamble on the timing, and the answer they choose is "read it faster", which is the
 * opposite of what the pause is for.
 */
export const showUndoToast = ({
  message,
  onUndo,
  durationMs = UNDO_WINDOW_MS,
}: {
  /** What just happened, in the past tense: "Annual Leave archived". */
  message: string;
  /** Puts it back. Its failure is surfaced as an ordinary error card. */
  onUndo: () => void | Promise<unknown>;
  durationMs?: number;
}) => {
  const id = toast.custom(
    (toastId) => (
      <UndoCard
        message={message}
        durationMs={durationMs}
        onUndo={async () => {
          // Dismiss first: the undo is what the reader asked for, and leaving the card up while it
          // runs invites a second press against a window that is already closing.
          toast.dismiss(toastId);
          try {
            await onUndo();
          } catch (error) {
            showError(error);
          }
        }}
      />
    ),
    { duration: durationMs },
  );

  return id;
};

/** Three seconds was the decision. Named so a caller widening it has to say so. */
export const UNDO_WINDOW_MS = 3000;

const UndoCard: React.FC<{
  message: string;
  durationMs: number;
  onUndo: () => void;
}> = ({ message, durationMs, onUndo }) => (
  <div
    role="status"
    className="relative w-[356px] overflow-hidden rounded-lg border border-brown-200 bg-white shadow-lg"
  >
    <div className="flex items-center justify-between gap-3 px-4 py-3">
      <p className="text-sm text-brown-900">{message}</p>

      <button
        type="button"
        onClick={onUndo}
        className="flex flex-none items-center gap-1.5 rounded-md px-2 py-1 text-sm font-medium text-brown-700 transition hover:bg-brown-50"
      >
        <Undo2 className="h-3.5 w-3.5" aria-hidden />
        Undo
      </button>
    </div>

    {/*
      Driven by CSS rather than a timer: a re-render every frame to move a bar is work the browser
      already does for free, and an animation cannot drift out of step with the dismissal the way a
      `setInterval` can when the tab is backgrounded.
    */}
    <span
      aria-hidden
      className="absolute bottom-0 left-0 h-0.5 bg-brown-400"
      style={{ animation: `undo-drain ${durationMs}ms linear forwards` }}
    />

    <style>{`@keyframes undo-drain { from { width: 100%; } to { width: 0%; } }`}</style>
  </div>
);
