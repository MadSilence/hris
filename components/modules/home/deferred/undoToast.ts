"use client";

import { toast } from "sonner";
import { UNDO_WINDOW_MS } from "./deferredWrites";

/**
 * A toast with Undo (PRODUCT-RULES 11: Undo in a toast instead of a confirm for anything that can be undone). It
 * lasts as long as the undo window, so the button never outlives the write it would stop.
 */
export const showUndoToast = (message: string, undoLabel: string, onUndo: () => void) =>
  toast.success(message, {
    duration: UNDO_WINDOW_MS,
    action: { label: undoLabel, onClick: onUndo },
  });
