"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { Add01Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/desact/icon";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/desact/dialog";
import { Button } from "@/components/desact/button";
import { Input } from "@/components/desact/input";
import { Skeleton } from "@/components/desact/skeleton";
import { RequiredLabel } from "@/components/ui/RequiredLabel";
import { FormError } from "@/components/feedback/FormError";
import { FieldError } from "@/components/desact/field-error";
import { ErrorState } from "@/components/feedback/ErrorState";
import { AudienceBuilder } from "@/components/audience/AudienceBuilder";
import { ActionStatus } from "@/components/models/ActionStatus";
import { useDateFormatter } from "@/lib/date";
import { useUserFields } from "@/components/modules/organization/hooks/useUserFields/useUserFields";
import { createCalibrationAction } from "@/components/modules/reviews/actions/reviewCycleActions";
import { useCalibrations, useInvalidateReviews } from "@/components/modules/reviews/hooks";
import { CalibrationStatusBadge } from "@/components/modules/reviews/shared/ReviewBadges";
import type { FilterDTO } from "@/models/user/fields";

/** A cycle's calibration sessions (REVIEWS_PLAN.md 12.1): a list, and Add Session while the cycle runs. */
export function CalibrationSessionsTab({ cycleId, canAdd }: { cycleId: string; canAdd: boolean }) {
  const t = useTranslations("reviews");
  const formatDisplayDate = useDateFormatter();
  const sessions = useCalibrations(cycleId);
  const [adding, setAdding] = useState(false);

  if (sessions.error) return <ErrorState error={sessions.error} />;
  if (!sessions.data) return <Skeleton className="h-32 w-full rounded-popover" aria-busy="true" />;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        <p className="min-w-0 flex-1 text-body text-tertiary">
          {t("calibration.sessions.intro")}
        </p>
        {canAdd && (
          <Button type="button" onClick={() => setAdding(true)}>
            <Icon icon={Add01Icon} size="sm" />{t("calibration.sessions.add")}
          </Button>
        )}
      </div>
      {sessions.data.length === 0 ? (
        <p className="rounded-card border border-divider bg-card px-5 py-6 text-center text-body text-tertiary">
          {t("calibration.sessions.empty")}
        </p>
      ) : (
        <ul className="space-y-2">
          {sessions.data.map((s) => (
            <li key={s.id} className="flex flex-wrap items-center gap-3 rounded-card border border-divider bg-card px-5 py-3">
              <Link href={`/reviews/calibrations/${s.id}`} className="font-medium text-accent-text underline-offset-4 hover:underline">
                {s.name}
              </Link>
              <CalibrationStatusBadge status={s.status} />
              <span className="text-hint text-tertiary">
                {s.createdByName
                  ? t("calibration.sessions.factsBy", {
                    count: s.people, calibrated: s.calibrated, name: s.createdByName,
                    date: formatDisplayDate(s.createdAt, { style: "medium" }),
                  })
                  : t("calibration.sessions.facts", {
                    count: s.people, calibrated: s.calibrated, date: formatDisplayDate(s.createdAt, { style: "medium" }),
                  })}
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
  const t = useTranslations("reviews");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const invalidate = useInvalidateReviews();
  const { data: fields, isLoading: fieldsLoading } = useUserFields();
  const [name, setName] = useState("");
  const [filters, setFilters] = useState<FilterDTO[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tried, setTried] = useState(false);
  useEffect(() => {
    if (open) {
      setTried(false);
      setName("");
      setFilters([]);
      setError(null);
    }
  }, [open]);

  const save = async () => {
    setTried(true);
    if (!name.trim()) return;
    setBusy(true);
    setError(null);
    try {
      const res = await createCalibrationAction({ cycleId, name: name.trim(), segment: { filters, excludeUserIds: [] } });
      if (res.status !== ActionStatus.SUCCESS || !res.data) {
        setError(res.errorMessage ?? t("error.generic"));
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
            <DialogTitle>{t("calibration.sessions.add")}</DialogTitle>
            <DialogDescription>
              {t("calibration.sessions.dialogDescription")}
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 space-y-4">
            <div className="space-y-1.5">
              <RequiredLabel htmlFor="calibration-name">{tCommon("fields.name")}</RequiredLabel>
              <Input id="calibration-name" value={name} maxLength={200} onChange={(e) => setName(e.target.value)}
                placeholder={t("calibration.sessions.namePlaceholder")} />
              <FieldError>{tried && !name.trim() ? tCommon("validation.enterName") : null}</FieldError>
            </div>
            <AudienceBuilder fields={fields} isLoadingFields={fieldsLoading} value={filters} onChange={setFilters} />
          </div>
          <FormError message={error} />
          <DialogFooter className="mt-4">
            <Button type="button" variant="secondary" onClick={onCloseAction} disabled={busy}>{tCommon("actions.cancel")}</Button>
            <Button type="submit" disabled={busy}>{busy ? t("addForm.adding") : tCommon("actions.add")}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
