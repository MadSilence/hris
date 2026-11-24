"use client";

import * as React from "react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { CheckmarkCircle02Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/desact/icon";
import { showError } from "@/lib/errors/errorToast";

/**
 * "Done — undo?", for five seconds (SPEC § 13.7).
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
 * **This is the reversal** (DECISIONS.md § "Undo and the Admin role", U-1): the act is already sent, and Undo calls its
 * inverse. An answer that journals, notifies or triggers is not taken back this way — it is held on the server, through
 * `holdWithUndo` beside this file. Nothing is ever held in the browser (U-2).
 */
export const showUndoToast = ({
  message,
  onUndo,
}: {
  /** What just happened, in the past tense: "Annual Leave archived". */
  message: string;
  /** Puts it back. Its failure is surfaced as an ordinary error card. */
  onUndo: () => void | Promise<unknown>;
}) => {
  let settled = false;
  return toast.custom(
    (toastId) => (
      <UndoCard
        message={message}
        onUndo={async () => {
          // Dismiss first: the undo is what the reader asked for, and leaving the card up while it
          // runs invites a second press against a window that is already closing.
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
    { duration: UNDO_WINDOW_MS },
  );
};

/** Five seconds, as every toast (SPEC § 13.7; three until 2026-11-23). Named so a caller widening it has to say so. */
export const UNDO_WINDOW_MS = 5000;

/**
 * The card both kinds of Undo show, as the designers drew it (T09 in `design/screens/documents-tab`, LW01c in
 * `home-widgets`; SPEC § 13.7): the round Pine check, what happened, and Undo as the one text action in the accent — no
 * icon on it, no close button, no bar. It goes on its own when its window ends.
 */
export const UndoCard: React.FC<{
  message: string;
  onUndo: () => void;
}> = ({ message, onUndo }) => {
  const t = useTranslations("common");
  return (
    <div
      role="status"
      className="flex w-[356px] items-center gap-3 rounded-popover border border-divider bg-overlay px-4 py-3 text-body text-primary shadow-popover"
    >
      <Icon icon={CheckmarkCircle02Icon} className="flex-none text-status-approved-icon" />
      <p className="min-w-0 flex-1 truncate">{message}</p>
      <button
        type="button"
        onClick={onUndo}
        className="ml-auto shrink-0 rounded-control px-2 py-1 text-body font-medium text-accent-text hover:bg-accent-subtle"
      >
        {t("actions.undo")}
      </button>
    </div>
  );
};
