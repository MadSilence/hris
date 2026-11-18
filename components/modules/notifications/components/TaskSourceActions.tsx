"use client";

import { FC, useState } from "react";
import { useTranslations } from "next-intl";
import { useQueryClient } from "@tanstack/react-query";
import { Cancel01Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/desact/icon";
import { Button } from "@/components/desact/button";
import { ActionStatus } from "@/components/models/ActionStatus";
import type { ActionResult } from "@/lib/errors/withActionError";
import { cn } from "@/lib/cn";
import { showActionError } from "@/lib/errors/errorToast";
import type { Notification } from "@/models/notifications";
import { completeMyTaskAction } from "@/components/modules/lifecycle/actions/lifecycleActions";
import { decideAutomationApprovalAction } from "@/components/modules/automations/actions/automationActions";
import { lifecycleQueryKeys } from "@/components/modules/lifecycle/hooks";
import { useMarkNotificationRead } from "@/components/modules/notifications/hooks/useNotificationMutations";
import { NOTIFICATIONS_QUERY_KEY } from "@/components/modules/notifications/utils/notificationsQueryKeys";

/** The sources whose line goes quiet once the work is done (A3): one task, a process's tasks, a cycle's, a signing. */
export const TASK_SOURCE_TYPES = new Set(["TASK", "PROCESS_TASKS", "REVIEW_CYCLE_TASKS", "ENVELOPE_SIGNER"]);

/** Tasks the inbox may tick done in place (A2) — the same kinds Home ticks. */
const TICKABLE = new Set(["TODO", "ACKNOWLEDGE"]);

type OutcomeKey =
  | "actions.taskOutcomes.done"
  | "actions.taskOutcomes.cancelled"
  | "actions.taskOutcomes.reassigned"
  | "actions.taskOutcomes.signed"
  | "actions.taskOutcomes.declined"
  | "actions.taskOutcomes.closed";

const OUTCOMES: Record<string, { key: OutcomeKey; className: string }> = {
  DONE: { key: "actions.taskOutcomes.done", className: "text-status-approved-text" },
  SIGNED: { key: "actions.taskOutcomes.signed", className: "text-status-approved-text" },
  CANCELLED: { key: "actions.taskOutcomes.cancelled", className: "text-tertiary" },
  REASSIGNED: { key: "actions.taskOutcomes.reassigned", className: "text-tertiary" },
  DECLINED: { key: "actions.taskOutcomes.declined", className: "text-danger-text" },
  EXPIRED: { key: "actions.taskOutcomes.closed", className: "text-tertiary" },
  CLOSED: { key: "actions.taskOutcomes.closed", className: "text-tertiary" },
};

/**
 * A line that asks the reader to do something (A3): once done, its outcome replaces the line's controls; while open,
 * the answers that take one click are given here (A2) — tick a to-do or an acknowledgement, approve or decline an
 * automation's approval. Everything else (sign, write a review, fill fields) opens its own screen through the row.
 */
export const TaskSourceActions: FC<{ notification: Notification }> = ({ notification }) => {
  const t = useTranslations("notifications");
  const queryClient = useQueryClient();
  const markRead = useMarkNotificationRead();
  const [busy, setBusy] = useState(false);
  const source = notification.source;
  if (!source) return null;

  if (!source.open) {
    const outcome = OUTCOMES[source.status ?? ""];
    if (!outcome) return null;
    return <p className={cn("mt-2 text-hint font-medium", outcome.className)}>{t(outcome.key)}</p>;
  }

  const kind = typeof source.details?.kind === "string" ? source.details.kind : null;
  if (source.type !== "TASK" || !kind) return null;

  const run = async (send: () => Promise<ActionResult<unknown>>) => {
    setBusy(true);
    try {
      const result = await send();
      if (result.status === ActionStatus.ERROR) showActionError(result);
      else if (!notification.read) markRead.mutate(notification.id);
    } finally {
      setBusy(false);
      // Server actions, not mutations: refresh the inbox, the one list (A1) and the task lists by hand.
      void queryClient.invalidateQueries({ queryKey: [NOTIFICATIONS_QUERY_KEY] });
      void queryClient.invalidateQueries({ queryKey: lifecycleQueryKeys.myTasksRoot });
    }
  };

  if (TICKABLE.has(kind)) {
    return (
      <div className="mt-3 flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
        <Button type="button" size="sm" variant="approve" disabled={busy} onClick={() => run(() => completeMyTaskAction({ id: source.id }))}>
          {t("actions.markDone")}
        </Button>
      </div>
    );
  }
  if (kind === "APPROVE_AUTOMATION") {
    return (
      <div className="mt-3 flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
        <Button type="button" size="sm" variant="approve" disabled={busy}
          onClick={() => run(() => decideAutomationApprovalAction({ taskId: source.id, approve: true }))}>
          {t("actions.approve")}
        </Button>
        <Button type="button" size="sm" variant="secondary" disabled={busy}
          onClick={() => run(() => decideAutomationApprovalAction({ taskId: source.id, approve: false }))}>
          <Icon icon={Cancel01Icon} size="sm" />
          {t("actions.decline")}
        </Button>
      </div>
    );
  }
  return null;
};
