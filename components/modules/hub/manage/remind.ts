"use client";

import { useTranslations } from "next-intl";
import { holdWithUndo } from "@/lib/feedback/holdWithUndo";
import { useInvalidateHub } from "../hooks";

/**
 * Remind {n} (CM01, CM08): **held on the server, not taken back** — "Reminded {n} people" shows with Undo until the
 * moment the server sends the reminders (DECISIONS.md § "Undo and the Admin role"). An empty list is everyone who has
 * not agreed yet. `onSent` runs once the reminders are held, and the lists are read again.
 */
export const useRemind = () => {
  const t = useTranslations("hub");
  const invalidate = useInvalidateHub();
  return (pageId: string, userIds: string[], count: number, onSent?: () => void) =>
    void holdWithUndo({
      kind: "HUB_REMIND",
      targetId: pageId,
      // `POST /hub/manage/pages/{id}/remind`'s own body.
      payload: { userIds },
      message: t("manage.toasts.reminded", { count }),
      invalidate,
    }).then((held) => {
      if (held) onSent?.();
    });
};
