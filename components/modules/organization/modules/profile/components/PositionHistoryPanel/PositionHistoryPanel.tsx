"use client";

import * as React from "react";
import { History } from "lucide-react";

import type { User } from "@/models/user/User";
import type { PositionChangeReason } from "@/models/user/PositionHistoryEntry";
import { formatDisplayDate } from "@/lib/date";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { Skeleton } from "@/public/desact/src/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/public/desact/src/components/ui/table";
import {
  ProfileSectionCard,
} from "@/components/modules/organization/modules/profile/components/PersonalInfoContainer/components/ProfileSectionCard";
import { useUserJobHistory } from "@/components/modules/organization/modules/profile/hooks/useUserJobHistory";

/** What moved the position. Short, because it sits in a column beside the names it explains. */
export const POSITION_CHANGE_REASON_LABELS: Record<PositionChangeReason, string> = {
  ASSIGNED: "Set on the profile",
  UNASSIGNED: "Cleared on the profile",
  BULK: "Bulk edit",
  JOB_ARCHIVED: "Position archived",
  JOB_DELETED: "Position deleted",
  FAMILY_ARCHIVED: "Job family archived",
  FAMILY_DELETED: "Job family deleted",
};

const COLUMNS = ["From", "Position", "Previous Position", "Reason"] as const;
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
          icon={<History className="h-6 w-6"/>}
          title="No position changes yet"
          description="When this person is given a position, or it changes, the date and the position appear here."
        />
      );
    }

    return (
      <Table>
        <TableHeader>
          <TableRow>
            {COLUMNS.map((column) => (
              <TableHead key={column}>{column}</TableHead>
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
                <TableCell className="text-muted-foreground">{entry.previousJobName ?? ""}</TableCell>
                <TableCell className="text-muted-foreground">
                  {POSITION_CHANGE_REASON_LABELS[entry.reason] ?? entry.reason}
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>
    );
  };

  return (
    <section aria-label="Position History" className={className}>
      <ProfileSectionCard title="Position History">
        {/*
          Honest about the dates: until changes can be dated in advance, the day a position took
          effect is the day somebody recorded it.
        */}
        <p className="pt-3 text-sm text-muted-foreground">
          Each date is the day the change was recorded.
        </p>
        {renderBody()}
      </ProfileSectionCard>
    </section>
  );
};
