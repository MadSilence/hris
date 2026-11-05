"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";

import { Switch } from "@/components/desact/switch";
import { Label } from "@/components/desact/label";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { showActionError } from "@/lib/errors/errorToast";
import { ActionStatus } from "@/components/models/ActionStatus";
import { completeMyTaskAction } from "@/components/modules/lifecycle/actions/lifecycleActions";
import { useInvalidateLifecycle, useMyTasks } from "@/components/modules/lifecycle/hooks";
import { TaskList } from "./TaskList";

/**
 * The Tasks tab: what is assigned to me, each done in its own row. Ad-hoc tasks are a later design. This is
 * where a preboarding's open tasks land once the person registers.
 */
export function MyTasksContainer() {
  const t = useTranslations("lifecycle");
  const [includeDone, setIncludeDone] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const { data, isLoading, error } = useMyTasks(includeDone);
  const invalidate = useInvalidateLifecycle();

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <div className="flex shrink-0 items-center justify-end gap-2">
        <Switch id="tasks-include-done" checked={includeDone} onCheckedChange={setIncludeDone} />
        <Label htmlFor="tasks-include-done">{t("myTasks.showDone")}</Label>
      </div>

      {/* The list scrolls; the empty state fills what is left instead of sitting in the corner. */}
      <div className="min-h-0 flex-1 overflow-y-auto">
      {error ? (
        <ErrorState error={error} />
      ) : isLoading ? (
        <div className="space-y-2">{[0, 1, 2].map((i) => <div key={i} className="h-16 shimmer rounded-control bg-mist" />)}</div>
      ) : (data ?? []).length === 0 ? (
        <EmptyState
          fill
          scene="all-caught-up"
          title={t("myTasks.emptyTitle")}
          description={t("myTasks.emptyDescription")}
        />
      ) : (
        <TaskList
          tasks={data ?? []}
          showSubject
          busyTaskId={busy}
          onCompleteAction={async (task, documentId) => {
            setBusy(task.id);
            try {
              const res = await completeMyTaskAction({ id: task.id, documentId });
              if (res.status !== ActionStatus.SUCCESS) showActionError(res);
              await invalidate();
            } finally {
              setBusy(null);
            }
          }}
          onChangedAction={async () => { await invalidate(); }}
        />
      )}
      </div>
    </div>
  );
}
