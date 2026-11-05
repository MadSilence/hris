"use client";

import * as React from "react";
import { useTranslations } from "next-intl";

import type { User } from "@/models/user/User";
import type { PositionChangeReason } from "@/models/user/PositionHistoryEntry";
import { useDateFormatter } from "@/lib/date";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { Skeleton } from "@/components/desact/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/desact/table";
import {
  ProfileSectionCard,
} from "@/components/modules/organization/modules/profile/components/PersonalInfoContainer/components/ProfileSectionCard";
import { useUserJobHistory } from "@/components/modules/organization/modules/profile/hooks/useUserJobHistory";

/** What moved the position. Short, because it sits in a column beside the names it explains. */
export const POSITION_CHANGE_REASON_LABELS = {
  ASSIGNED: "profile.positionHistory.reason.assigned",
  UNASSIGNED: "profile.positionHistory.reason.unassigned",
  BULK: "profile.positionHistory.reason.bulk",
  IMPORTED: "profile.positionHistory.reason.imported",
  JOB_ARCHIVED: "profile.positionHistory.reason.jobArchived",
  JOB_DELETED: "profile.positionHistory.reason.jobDeleted",
  FAMILY_ARCHIVED: "profile.positionHistory.reason.familyArchived",
  FAMILY_DELETED: "profile.positionHistory.reason.familyDeleted",
} as const satisfies Record<PositionChangeReason, string>;

const COLUMNS = [
  "profile.positionHistory.columns.from",
  "profile.positionHistory.columns.position",
  "profile.positionHistory.columns.previous",
  "profile.positionHistory.columns.reason",
] as const;
const SKELETON_ROWS = 3;

type Props = {
  userId: string;
  /** The profile as the server returned it — `fieldAccess` says whether the position is visible. */
  user?: User;
  /** Placement is the caller's: the panel does not know whether it stands in a scroll area or below one. */
  className?: string;
};

/**
 * From which day this person held which position.
 *
 * **Not the journal.** The Logs page answers "who pressed what, and when"; this answers "since when",
 * so it shows no actor and no time of day. The names are what each position was called at the time —
 * the job may be renamed or gone since, and the timeline must outlive the catalogue.
 *
 * **Drawn only for a reader who may see the position on this person.** The server leaves `sys:job`
 * out of `fieldAccess` for anybody else and refuses the timeline outright; a panel saying "no
 * history" to them would be the interface claiming more than it knows.
 */
export const PositionHistoryPanel: React.FC<Props> = ({ userId, user, className }) => {
  const t = useTranslations("organization");
  const formatDisplayDate = useDateFormatter();
  const canSeePosition = Boolean(user?.fieldAccess?.["sys:job"]);

  const { data, isLoading, error, refetch } = useUserJobHistory(userId, {
    enabled: canSeePosition,
    currentJobId: user?.jobId,
  });

  // Below every hook, per the house rule about early returns.
  if (!canSeePosition) return null;

  const renderBody = () => {
    if (error) {
      return <ErrorState error={error} compact onRetry={() => void refetch()}/>;
    }

    if (!isLoading && (data?.length ?? 0) === 0) {
      return (
        <EmptyState
          className="my-4"
          scene="notes"
          title={t("profile.positionHistory.emptyTitle")}
          description={t("profile.positionHistory.emptyDescription")}
        />
      );
    }

    return (
      <Table>
        <TableHeader>
          <TableRow>
            {COLUMNS.map((column) => (
              <TableHead key={column}>{t(column)}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading
            ? Array.from({ length: SKELETON_ROWS }, (_, row) => (
              <TableRow key={`skeleton-${row}`} data-test="position-history-skeleton-row">
                {COLUMNS.map((column) => (
                  <TableCell key={column}>
                    <Skeleton className="h-4 w-24"/>
                  </TableCell>
                ))}
              </TableRow>
            ))
            : (data ?? []).map((entry) => (
              <TableRow key={entry.id}>
                <TableCell className="whitespace-nowrap">
                  {formatDisplayDate(entry.changedAt, { style: "medium" })}
                </TableCell>
                {/* A cleared position is an empty cell — the reason column says why it is empty. */}
                <TableCell>{entry.jobName ?? ""}</TableCell>
                <TableCell className="text-tertiary">{entry.previousJobName ?? ""}</TableCell>
                <TableCell className="text-tertiary">
                  {entry.reason in POSITION_CHANGE_REASON_LABELS ? t(POSITION_CHANGE_REASON_LABELS[entry.reason]) : entry.reason}
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>
    );
  };

  return (
    <section aria-label={t("profile.positionHistory.title")} className={className}>
      <ProfileSectionCard title={t("profile.positionHistory.title")}>
        {/*
          Honest about the dates: until changes can be dated in advance, the day a position took
          effect is the day somebody recorded it.
        */}
        <p className="pt-3 text-body text-tertiary">
          {t("profile.positionHistory.datesNote")}
        </p>
        {renderBody()}
      </ProfileSectionCard>
    </section>
  );
};
