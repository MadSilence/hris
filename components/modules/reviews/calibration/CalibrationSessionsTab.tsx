"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/public/desact/src/components/ui/dialog";
import { Button } from "@/public/desact/src/components/ui/button";
import { Input } from "@/public/desact/src/components/ui/input";
import { Skeleton } from "@/public/desact/src/components/ui/skeleton";
import { RequiredLabel } from "@/components/ui/RequiredLabel";
import { FormError } from "@/components/feedback/FormError";
import { ErrorState } from "@/components/feedback/ErrorState";
import { AudienceBuilder } from "@/components/audience/AudienceBuilder";
import { ActionStatus } from "@/components/models/ActionStatus";
import { formatDisplayDate } from "@/lib/date";
import { useUserFields } from "@/components/modules/organization/hooks/useUserFields/useUserFields";
import { createCalibrationAction } from "@/components/modules/reviews/actions/reviewCycleActions";
import { useCalibrations, useInvalidateReviews } from "@/components/modules/reviews/hooks";
import { CalibrationStatusBadge } from "@/components/modules/reviews/shared/ReviewBadges";
import type { FilterDTO } from "@/models/user/fields";

/** A cycle's calibration sessions (REVIEWS_PLAN.md 12.1): a list, and Add Session while the cycle runs. */
export function CalibrationSessionsTab({ cycleId, canAdd }: { cycleId: string; canAdd: boolean }) {
  const sessions = useCalibrations(cycleId);
  const [adding, setAdding] = useState(false);

  if (sessions.error) return <ErrorState error={sessions.error} />;
  if (!sessions.data) return <Skeleton className="h-32 w-full rounded-xl" aria-busy="true" />;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        <p className="min-w-0 flex-1 text-sm text-muted-foreground">
          Line up final ratings across managers, each change with a reason, and set each person&apos;s potential for the
          9-box. Only people whose review is not shared yet can change.
        </p>
        {canAdd && (
          <Button type="button" onClick={() => setAdding(true)}>
            <Plus className="mr-1 h-4 w-4" />Add Session
          </Button>
        )}
      </div>
      {sessions.data.length === 0 ? (
        <p className="rounded-xl border border-brown-100 bg-white px-5 py-6 text-center text-sm text-muted-foreground">
          No calibration sessions yet.
        </p>
      ) : (
        <ul className="space-y-2">
          {sessions.data.map((s) => (
            <li key={s.id} className="flex flex-wrap items-center gap-3 rounded-xl border border-brown-100 bg-white px-5 py-3">
              <Link href={`/reviews/calibrations/${s.id}`} className="font-medium text-brown-900 underline-offset-4 hover:underline">
                {s.name}
              </Link>
              <CalibrationStatusBadge status={s.status} />
              <span className="text-xs text-muted-foreground">
                {s.people} {s.people === 1 ? "person" : "people"} · {s.calibrated} calibrated
                {s.createdByName ? ` · added by ${s.createdByName}` : ""} · {formatDisplayDate(s.createdAt, { style: "medium" })}
              </span>
            </li>
          ))}
        </ul>
      )}
      <AddSessionDialog cycleId={cycleId} open={adding} onCloseAction={() => setAdding(false)} />
    </div>
  );
}

/** A name and who is in it — the cycle's own segment model, over its participants. */
function AddSessionDialog({ cycleId, open, onCloseAction }: { cycleId: string; open: boolean; onCloseAction: () => void }) {
  const router = useRouter();
  const invalidate = useInvalidateReviews();
  const { data: fields, isLoading: fieldsLoading } = useUserFields();
  const [name, setName] = useState("");
  const [filters, setFilters] = useState<FilterDTO[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    if (open) {
      setName("");
      setFilters([]);
      setError(null);
    }
  }, [open]);

  const save = async () => {
    if (!name.trim()) return;
    setBusy(true);
    setError(null);
    try {
      const res = await createCalibrationAction({ cycleId, name: name.trim(), segment: { filters, excludeUserIds: [] } });
      if (res.status !== ActionStatus.SUCCESS || !res.data) {
        setError(res.errorMessage ?? "Something went wrong.");
        return;
      }
      await invalidate();
      onCloseAction();
      router.push(`/reviews/calibrations/${res.data.id}`);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v && !busy) onCloseAction(); }}>
      <DialogContent className="sm:max-w-2xl">
        <form onSubmit={(e) => { e.preventDefault(); void save(); }}>
          <DialogHeader>
            <DialogTitle>Add Session</DialogTitle>
            <DialogDescription>
              With no conditions, everybody in the cycle is in the session. Who is in it is read now, once.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 space-y-4">
            <div className="space-y-1.5">
              <RequiredLabel htmlFor="calibration-name">Name</RequiredLabel>
              <Input id="calibration-name" value={name} maxLength={200} onChange={(e) => setName(e.target.value)}
                placeholder="Engineering calibration" />
            </div>
            <AudienceBuilder fields={fields} isLoadingFields={fieldsLoading} value={filters} onChange={setFilters} />
          </div>
          <FormError message={error} />
          <DialogFooter className="mt-4">
            <Button type="button" variant="outline" onClick={onCloseAction} disabled={busy}>Cancel</Button>
            <Button type="submit" disabled={busy || !name.trim()}>{busy ? "Adding…" : "Add"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
