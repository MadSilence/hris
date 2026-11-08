"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { Add01Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/desact/icon";
import { Button } from "@/components/desact/button";
import { Skeleton } from "@/components/desact/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/desact/table";
import { EmptyState } from "@/components/feedback/EmptyState";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { ErrorState } from "@/components/feedback/ErrorState";
import { showSuccess } from "@/lib/errors/errorToast";
import { messageForError } from "@/lib/errors/errorMessages";
import { useDateFormatter } from "@/lib/date";
import { formatMinutes, WEEKDAY_FIELDS, type WorkSchedule, type WorkScheduleWriteRequest } from "@/models/attendance";
import { AttendanceActionError, useAddWorkSchedule, useWorkSchedules } from "@/components/modules/attendance/hooks";
import { AddWorkScheduleModal } from "./AddWorkScheduleModal";

type Props = {
  userId: string;
  /** The company's today (`yyyy-MM-dd`), to say which schedule is in force. Falls back to none marked. */
  today?: string;
  /** Server-answered: may the caller add a schedule for this person. */
  canEdit: boolean;
};

/** The schedule in force on a date: the latest one not after it. Rows arrive newest first. */
export const scheduleInForce = (schedules: WorkSchedule[], today?: string): WorkSchedule | null => {
  if (!today) return null;
  return schedules.find((schedule) => schedule.effectiveFrom <= today) ?? null;
};

const weeklyHours = (schedule: WorkSchedule) =>
  WEEKDAY_FIELDS.reduce((sum, field) => sum + Number(schedule[field.key] ?? 0), 0);

/**
 * A person's working week over time. Read-only history plus one
 * action: add a schedule from a date. Somebody with no schedule works the company week.
 */
export const WorkSchedulePanel: React.FC<Props> = ({ userId, today, canEdit }) => {
  const formatDisplayDate = useDateFormatter();
  const t = useTranslations("attendance");
  const tCommon = useTranslations("common");
  const { data: schedules, isLoading, error, refetch } = useWorkSchedules(userId);
  const addSchedule = useAddWorkSchedule();
  const [adding, setAdding] = useState(false);

  const submit = async (body: WorkScheduleWriteRequest): Promise<string | null> => {
    try {
      await addSchedule.mutateAsync({ userId, body });
      showSuccess(t("schedule.added"));
      return null;
    } catch (caught) {
      return caught instanceof AttendanceActionError
        ? caught.result.errorMessage ?? messageForError(caught)
        : messageForError(caught);
    }
  };

  const current = scheduleInForce(schedules ?? [], today);

  return (
    <section className="space-y-3" aria-labelledby="work-schedule-heading">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 id="work-schedule-heading" className="text-section-title">{t("schedule.title")}</h2>
          <p className="text-body text-tertiary">{t("schedule.description")}</p>
        </div>
        {canEdit && (
          <Button type="button" onClick={() => setAdding(true)} >
            <Icon icon={Add01Icon} size="sm" />
            {t("schedule.add")}
          </Button>
        )}
      </div>

      {error ? (
        <ErrorState error={error} compact onRetry={() => void refetch()}/>
      ) : !isLoading && (schedules ?? []).length === 0 ? (
        <EmptyState
          compact
          scene="attendance-s"
          title={t("schedule.emptyTitle")}
          description={t("schedule.emptyDescription")}
          onCreate={canEdit ? () => setAdding(true) : undefined}
          createLabel={canEdit ? t("schedule.add") : undefined}
        />
      ) : (
        <div className="rounded-control border border-divider bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("schedule.effectiveFrom")}</TableHead>
                {WEEKDAY_FIELDS.map((field) => <TableHead key={field.key}>{tCommon(field.labelKey)}</TableHead>)}
                <TableHead>{t("schedule.weeklyHours")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading
                ? Array.from({ length: 2 }, (_, index) => (
                  <TableRow key={index}>
                    <TableCell><Skeleton className="h-4 w-24"/></TableCell>
                    {WEEKDAY_FIELDS.map((field) => <TableCell key={field.key}><Skeleton className="h-4 w-6"/></TableCell>)}
                    <TableCell><Skeleton className="h-4 w-10"/></TableCell>
                  </TableRow>
                ))
                : (schedules ?? []).map((schedule) => (
                  <TableRow key={schedule.id}>
                    <TableCell className="whitespace-nowrap">
                      {formatDisplayDate(schedule.effectiveFrom, { style: "medium" })}
                      {current?.id === schedule.id && <StatusBadge status="active" label={t("schedule.inForce")} className="ml-2"/>}
                    </TableCell>
                    {WEEKDAY_FIELDS.map((field) => (
                      <TableCell key={field.key} className="tabular-nums">{formatMinutes(Number(schedule[field.key]) * 60)}</TableCell>
                    ))}
                    <TableCell className="tabular-nums">{formatMinutes(weeklyHours(schedule) * 60)}</TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </div>
      )}

      {canEdit && (
        <AddWorkScheduleModal
          isOpen={adding}
          current={current}
          onCloseAction={() => setAdding(false)}
          onSubmitAction={submit}
        />
      )}
    </section>
  );
};
