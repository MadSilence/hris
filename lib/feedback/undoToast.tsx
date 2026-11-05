"use client";

import * as React from "react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { Undo02Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/desact/icon";
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
 *
 * **Held back, not taken back** — `onExpire`: for an act that cannot be reversed once sent (an approval tells the
 * requester at once), the caller does not do it yet; it does it in `onExpire`, when the toast ends without an Undo —
 * timed out or swiped away. Undo then simply never sends it (the owner, 2026-11-05, D1). Exactly one of the two runs.
 */
export const showUndoToast = ({
  message,
  onUndo,
  onExpire,
  durationMs = UNDO_WINDOW_MS,
}: {
  /** What just happened, in the past tense: "Annual Leave archived". */
  message: string;
  /** Puts it back. Its failure is surfaced as an ordinary error card. */
  onUndo: () => void | Promise<unknown>;
  /** The toast ended without an Undo: do what was held back. */
  onExpire?: () => void;
  durationMs?: number;
}) => {
  let settled = false;
  const expire = () => {
    if (settled) return;
    settled = true;
    onExpire?.();
  };
  const id = toast.custom(
    (toastId) => (
      <UndoCard
        message={message}
        durationMs={durationMs}
        onUndo={async () => {
          // Dismiss first: the undo is what the reader asked for, and leaving the card up while it
          // runs invites a second press against a window that is already closing. Settled first, so the
          // dismissal is not read as the toast running out.
          if (settled) return;
          settled = true;
          toast.dismiss(toastId);
          try {
            await onUndo();
          } catch (error) {
            showError(error);
          }
        }}
      />
    ),
    { duration: durationMs, onAutoClose: expire, onDismiss: expire },
  );

  return id;
};

/** Three seconds was the decision. Named so a caller widening it has to say so. */
export const UNDO_WINDOW_MS = 3000;

const UndoCard: React.FC<{
  message: string;
  durationMs: number;
  onUndo: () => void;
}> = ({ message, durationMs, onUndo }) => {
  const t = useTranslations("common");
  return (
  <div
    role="status"
    className="relative w-[356px] overflow-hidden rounded-control border border-divider bg-card shadow-popover"
  >
    <div className="flex items-center justify-between gap-3 px-4 py-3">
      <p className="text-body text-primary">{message}</p>

      <button
        type="button"
        onClick={onUndo}
        className="flex flex-none items-center gap-1.5 rounded-control px-2 py-1 text-body font-medium text-secondary transition hover:bg-subtle"
      >
        <Icon icon={Undo02Icon} size="sm" />
        {t("actions.undo")}
      </button>
    </div>

    {/*
      Driven by CSS rather than a timer: a re-render every frame to move a bar is work the browser
      already does for free, and an animation cannot drift out of step with the dismissal the way a
      `setInterval` can when the tab is backgrounded.
    */}
    <span
      aria-hidden
      className="absolute bottom-0 left-0 h-0.5 bg-strong"
      style={{ animation: `undo-drain ${durationMs}ms linear forwards` }}
    />

    <style>{`@keyframes undo-drain { from { width: 100%; } to { width: 0%; } }`}</style>
  </div>
  );
};
