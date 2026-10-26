"use client";

import React, { useId, useState } from "react";
import { Button } from "@/public/desact/src/components/ui/button";
import { Input } from "@/public/desact/src/components/ui/input";
import { ConfirmActionModal } from "@/components/ui/ConfirmActionModal";
import { RequiredLabel } from "@/components/ui/RequiredLabel";
import { useDecideAnyway } from "@/components/modules/settings/modules/time/timeOff/timeOffRequests/hooks/useDecideAnyway";
import type { DecideAnywayDecision } from "@/components/modules/settings/modules/time/timeOff/timeOffRequests/actions/decideAnywayTimeOffRequestAction";

type Props = {
  requestId: string;
  requesterName?: string | null;
  /** Called after the decision went through, for the caller to refresh what it shows. */
  onDecided?: () => void | Promise<unknown>;
  size?: "sm" | "default";
};

/**
 * Approve Anyway / Reject Anyway — an administrator deciding over the approval chain, whatever steps
 * are still open (DECISIONS.md § "Owner decisions of 2026-10-16", item 6). Shown only where the backend
 * said the reader may (`canDecideAnyway`, or PEOPLE.TIME_OFF MANAGE in the person's tab); the backend
 * checks again and journals it as an override.
 *
 * Both open a confirmation: it skips people who were asked and have not answered, which is exactly the
 * kind of act that should not happen by a stray click. The dialog stays open while it runs and while it
 * fails, so a refusal is read where it was asked (`ACTIONS_AND_MENUS.md` § 7).
 */
export const DecideAnywayControls: React.FC<Props> = ({ requestId, requesterName, onDecided, size = "sm" }) => {
  const decide = useDecideAnyway();
  const [open, setOpen] = useState<DecideAnywayDecision | null>(null);
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const reasonId = useId();
  const who = requesterName?.trim() || "this person";

  const close = () => {
    setOpen(null);
    setReason("");
    setError(null);
  };

  const confirm = async () => {
    if (!open) return;
    if (open === "REJECT" && !reason.trim()) {
      setError("Say why it is rejected.");
      return;
    }
    setError(null);
    try {
      await decide.mutateAsync({
        requestId,
        decision: open,
        rejectionReason: open === "REJECT" ? reason.trim() : undefined,
      });
      close();
      await onDecided?.();
    } catch (e) {
      setError(e instanceof Error ? e.message : "The request could not be decided.");
    }
  };

  return (
    <>
      <Button type="button" variant="outline" size={size} onClick={() => setOpen("APPROVE")} disabled={decide.isPending}>
        Approve Anyway
      </Button>
      <Button
        type="button"
        variant="ghost"
        size={size}
        className="text-muted-foreground hover:text-destructive"
        onClick={() => setOpen("REJECT")}
        disabled={decide.isPending}
      >
        Reject Anyway
      </Button>

      <ConfirmActionModal
        isOpen={open !== null}
        title={open === "REJECT" ? "Reject Anyway?" : "Approve Anyway?"}
        description={
          open === "REJECT"
            ? `The request of ${who} is rejected now, over the approvers who have not answered yet. It is recorded as an override.`
            : `The request of ${who} is approved now, whatever approval steps are still open. It is recorded as an override.`
        }
        confirmLabel={open === "REJECT" ? "Reject Anyway" : "Approve Anyway"}
        destructive={open === "REJECT"}
        isLoading={decide.isPending}
        errorMessage={error}
        onConfirmAction={confirm}
        onCancelAction={close}
      >
        {open === "REJECT" && (
          <div className="flex flex-col gap-1.5">
            <RequiredLabel htmlFor={reasonId} required>Reason</RequiredLabel>
            <Input id={reasonId} value={reason} onChange={(e) => setReason(e.currentTarget.value)} autoFocus />
          </div>
        )}
      </ConfirmActionModal>
    </>
  );
};
