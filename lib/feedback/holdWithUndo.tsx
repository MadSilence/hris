"use client";

import { toast } from "sonner";
import { ActionStatus } from "@/components/models/ActionStatus";
import { showActionError, showError } from "@/lib/errors/errorToast";
import type { ActionResult } from "@/lib/errors/withActionError";
import type { HeldActionKind } from "@/models/heldActions";
import {
  applyHeldActionAction,
  cancelHeldActionAction,
  holdActionAction,
} from "@/components/modules/heldActions/actions";
import { UndoCard } from "./undoToast";

/**
 * The backend's code for an Undo that came too late — `DELETE /held-actions/{id}` answering 409 because the action is
 * already applied (`HeldActionBusinessError.ALREADY_APPLIED`). Its words are `messages/<lang>/errors.json` under the
 * same key.
 */
export const HELD_ACTION_ALREADY_APPLIED = "HELD00001";

/**
 * After the moment has passed, how long until the lists the action changes are read again: the server's worker claims
 * due rows every second, so it is applied within about that.
 */
export const APPLIED_SETTLE_MS = 1500;

type Invalidate = () => unknown;

/**
 * A server action that could not be called at all (the network, a deploy) throws rather than answering; it is shown as
 * any failure is, and read as a refusal.
 */
const call = async <T,>(action: () => Promise<ActionResult<T>>): Promise<ActionResult<T> | null> => {
  try {
    return await action();
  } catch (error) {
    showError(error);
    return null;
  }
};

/** Re-reads, whatever it answers: a failed refresh is the query's own business, shown where the list is. */
const refresh = async (invalidate: Invalidate) => {
  try {
    await invalidate();
  } catch {
    // The list shows its own error state.
  }
};

const refusedOtherThanTooLate = (result: ActionResult<unknown> | null) =>
  result !== null && result.status !== ActionStatus.SUCCESS && result.code !== HELD_ACTION_ALREADY_APPLIED;

/**
 * An answer with Undo that is **held on the server** (DECISIONS.md § "Undo and the Admin role", U-1 – U-6;
 * `technical_documentation/ui/ACTIONS_AND_MENUS.md` § 8): approve, task done, unpublish, remind.
 *
 * The answer is sent at once. The server checks it now — a refusal shows at once, as the direct call's would, and no
 * toast follows — stores it, and answers with the moment it takes effect; the server applies it then, whatever the
 * browser does meanwhile (a reload, a closed tab, a sign-out). The toast lasts exactly until that moment:
 *
 * - **Undo** cancels it on the server; too late, and the reader is told it was already applied;
 * - **closing the toast** (swiping it away) applies it now;
 * - **running out** does nothing here — the server applies it.
 *
 * Sonner pauses its own timer while the toast is hovered and while the page is hidden, and 2.0.7 has no option to turn
 * either off — so sonner is told the toast never ends, and the toast is closed here at the server's moment instead.
 *
 * While held, the server already reads the answer as given *for its author* (U-4): `invalidate` re-reads the lists the
 * kind touches, after the hold, after Undo, after closing, and once the moment has passed. Nothing is kept on the
 * page to hide what was answered.
 *
 * Resolves `true` once the answer is held and the lists are read again, `false` when it was refused.
 */
export const holdWithUndo = async ({
  kind,
  targetId,
  payload,
  message,
  invalidate,
}: {
  kind: HeldActionKind;
  /** The id the direct endpoint takes in its path. */
  targetId: string;
  /** Exactly the body the direct endpoint takes; left out when it takes none. */
  payload?: Record<string, unknown>;
  /** What just happened, in the past tense: "Approved". */
  message: string;
  /** Re-reads what the kind changes for the reader. */
  invalidate: Invalidate;
}): Promise<boolean> => {
  const held = await call(() => holdActionAction(payload === undefined ? { kind, targetId } : { kind, targetId, payload }));
  if (held === null) return false;
  if (held.status !== ActionStatus.SUCCESS || !held.data) {
    showActionError(held);
    return false;
  }
  const { id, windowMs } = held.data;

  let settled = false;
  const settle = () => {
    if (settled) return false;
    settled = true;
    clearTimeout(timer);
    return true;
  };

  const toastId = toast.custom(
    (ownId) => (
      <UndoCard
        message={message}
        onUndo={() => {
          if (!settle()) return;
          toast.dismiss(ownId);
          void (async () => {
            const result = await call(() => cancelHeldActionAction(id));
            // A 409 reads "Already applied" from the catalogue — the one refusal an Undo can meet that is not a fault.
            if (result !== null && result.status !== ActionStatus.SUCCESS) showActionError(result);
            await refresh(invalidate);
          })();
        }}
      />
    ),
    {
      duration: Infinity,
      // The reader closed it: apply now. Too late to matter (already applied) is not worth a word.
      onDismiss: () => {
        if (!settle()) return;
        void (async () => {
          const result = await call(() => applyHeldActionAction(id));
          if (result !== null && refusedOtherThanTooLate(result)) showActionError(result);
          setTimeout(() => void refresh(invalidate), APPLIED_SETTLE_MS);
        })();
      },
    },
  );

  // The server's moment: the toast goes, and the server applies it on its own.
  // Read by `settle` only from the toast's handlers, which cannot run before this line.
  const timer = setTimeout(() => {
    if (!settle()) return;
    toast.dismiss(toastId);
    setTimeout(() => void refresh(invalidate), APPLIED_SETTLE_MS);
  }, windowMs);

  await refresh(invalidate);
  return true;
};
