"use client";

import React, { useState } from "react";
import { ListChecks } from "lucide-react";
import { Switch } from "@/public/desact/src/components/ui/switch";
import { Label } from "@/public/desact/src/components/ui/label";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { showActionError } from "@/lib/errors/errorToast";
import { ActionStatus } from "@/components/models/ActionStatus";
import { completeMyTaskAction } from "@/components/modules/lifecycle/actions/lifecycleActions";
import { useInvalidateLifecycle, useMyTasks } from "@/components/modules/lifecycle/hooks";
import { TaskList } from "./TaskList";

/**
 * The Tasks tab: what is assigned to me. Deliberately small — the full Tasks feature (ad-hoc tasks,
 * comments) is a later design. This is where a preboarding's open tasks land once the person registers.
 */
export function MyTasksContainer() {
  const [includeDone, setIncludeDone] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const { data, isLoading, error } = useMyTasks(includeDone);
  const invalidate = useInvalidateLifecycle();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end gap-2">
        <Switch id="tasks-include-done" checked={includeDone} onCheckedChange={setIncludeDone} />
        <Label htmlFor="tasks-include-done">Show Done</Label>
      </div>

      {error ? (
        <ErrorState error={error} />
      ) : isLoading ? (
        <div className="space-y-2">{[0, 1, 2].map((i) => <div key={i} className="h-16 animate-pulse rounded-md bg-muted" />)}</div>
      ) : (data ?? []).length === 0 ? (
        <EmptyState
          icon={<ListChecks className="h-6 w-6" />}
          title="Nothing to do"
          description="Tasks assigned to you by a preboarding or an onboarding appear here."
        />
      ) : (
        <TaskList
          tasks={data ?? []}
          showSubject
          busyTaskId={busy}
          onCompleteAction={async (task) => {
            setBusy(task.id);
            try {
              const res = await completeMyTaskAction(task.id);
              if (res.status !== ActionStatus.SUCCESS) showActionError(res);
              await invalidate();
            } finally {
              setBusy(null);
            }
          }}
        />
      )}
    </div>
  );
}
