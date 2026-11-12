"use client";

import { useTranslations } from "next-intl";
import { showUndoToast } from "@/lib/feedback/undoToast";
import { showError } from "@/lib/errors/errorToast";
import { remindHubPageAction } from "../actions";
import { unwrapHub, useInvalidateHub } from "../hooks";

/** Remind's Undo window: 5 s, before anything is sent (CM08 "Reminder sent"). */
export const REMIND_UNDO_MS = 5000;

/**
 * Remind {n} (CM01, CM08): **held back, not taken back** — the toast "Reminded {n} people" shows with Undo for
 * 5 s, and the reminder goes out only when it ends without one. An empty list is everyone who has not agreed yet.
 */
export const useRemind = () => {
  const t = useTranslations("hub");
  const invalidate = useInvalidateHub();
  return (pageId: string, userIds: string[], count: number, onSent?: () => void) =>
    showUndoToast({
      message: t("manage.toasts.reminded", { count }),
      durationMs: REMIND_UNDO_MS,
      onUndo: () => undefined,
      onExpire: () => {
        void (async () => {
          try {
            unwrapHub(await remindHubPageAction({ id: pageId, userIds }));
            void invalidate();
            onSent?.();
          } catch (error) {
            showError(error);
          }
        })();
      },
    });
};
