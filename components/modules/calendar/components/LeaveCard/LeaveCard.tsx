"use client";

import { FC, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { ArrowExpand01Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/desact/icon";
import { Button } from "@/components/desact/button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { PolicyMarker } from "@/components/ui/PolicyMarker";
import { useShortDates } from "@/lib/date";
import { formatDayAmount } from "@/models/timeOff/formatDayAmount";
import type { CompanyCalendarAbsence } from "@/models/calendar";
import { useLeaveName } from "@/components/modules/calendar/components/LeavePill/LeavePill";
import { backDay, requestSpan, type AlsoAway } from "@/components/modules/calendar/lib/leaveText";

type Props = {
  absence: CompanyCalendarAbsence;
  isNonWorkingDay: (d: Date) => boolean;
  /** Pending: who else on the board is away then (N05's amber line). */
  alsoAway?: AlsoAway | null;
  /** ↗ — the request in full (profile-time-off Q30). A rendered control, so the caller decides dialog or page. */
  openFull?: ReactNode;
  /** Decline / Approve — given only to someone who can decide this request. */
  onApprove?: () => void;
  onDecline?: () => void;
};

/**
 * The compact leave card (N04 approved, N05 pending; reduced A3): 300 wide, padding 16, gap 12. The policy and its status with ↗
 * at the top right; the dates 18/26 600, then "5 days · back Mon 23 Nov"; the person's comment as a grey bubble; on a
 * pending request the line about who else is away, and Decline / Approve for whoever can decide it. No person row, no
 * "Open request" button.
 *
 * **What it says is what the server sent** (`COMPANY_CALENDAR.md` § 6, the owner's R4): the length and the comment
 * come only to the person and a holder of `PEOPLE.TIME_OFF` over them; everybody else sees the policy — or "Away" —
 * and the dates. The card is content only; the caller places it (a popover on the board, the profile's own panel).
 */
export const LeaveCard: FC<Props> = ({ absence, isNonWorkingDay, alsoAway, openFull, onApprove, onDecline }) => {
  const t = useTranslations("calendar");
  const shortDates = useShortDates();
  const name = useLeaveName()(absence);
  const { start, end } = requestSpan(absence);
  const back = shortDates.date(backDay(end, isNonWorkingDay), { weekday: true, hideYear: true });
  const length =
    absence.amount === undefined || absence.amount === null
      ? null
      : absence.unit === "HOURS"
        ? t("card.hours", { count: absence.amount, amount: formatDayAmount(absence.amount) })
        : absence.countingMode === "WORKING_DAYS"
          ? t("card.workingDays", { count: absence.amount, amount: formatDayAmount(absence.amount) })
          : t("card.days", { count: absence.amount, amount: formatDayAmount(absence.amount) });
  const pending = absence.status !== "APPROVED";
  // A3: a reader who may not see this time off — no length came, and they cannot open it — gets the policy (or
  // "Away"), the dates and the day they are back. No status, no comment, no ↗, no actions.
  const reduced = (absence.amount === undefined || absence.amount === null) && !absence.requestId;

  if (reduced) {
    return (
      <div className="flex flex-col gap-3">
        <div className="flex h-7 items-center gap-2 text-body font-medium text-secondary">
          <PolicyMarker color={absence.policyName || absence.leaveTypeName ? absence.policyColor : null} />
          <span className="min-w-0 truncate">{name}</span>
        </div>
        <div className="flex flex-col gap-1">
          <p className="font-heading text-section-title text-primary">
            {shortDates.range(start, end, { weekday: true })}
          </p>
          <p className="text-body text-tertiary">{t("card.back", { date: back })}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex h-7 items-center gap-2 text-body font-medium text-secondary">
        <PolicyMarker color={absence.policyName || absence.leaveTypeName ? absence.policyColor : null} />
        <span className="min-w-0 truncate">{name}</span>
        <span className="flex-1" />
        <StatusBadge
          size="sm"
          status={pending ? "pending" : "approved"}
          label={
            absence.status === "CANCELLATION_PENDING"
              ? t("card.status.cancellationPending")
              : pending
                ? t("card.status.pending")
                : t("card.status.approved")
          }
        />
        {openFull}
      </div>

      <div className="flex flex-col gap-1">
        <p className="font-heading text-section-title text-primary">
          {shortDates.range(start, end, { weekday: true })}
        </p>
        <p className="text-body text-tertiary">
          {length ? t("card.lengthAndBack", { length, back }) : t("card.back", { date: back })}
        </p>
      </div>

      {absence.comment ? (
        // The speech bubble's corner (N04): square where it "comes from", round elsewhere — no radius role says that.
        <p
          className="max-w-full self-start bg-mist px-3 py-2 text-body whitespace-pre-line text-primary"
          style={{ borderRadius: "4px 12px 12px 12px" }}
        >
          {absence.comment}
        </p>
      ) : null}

      {pending && alsoAway ? (
        <p className="rounded-control bg-status-pending-bg px-3 py-2.5 text-body text-status-pending-text">
          {t("card.alsoAway", { name: alsoAway.first, others: alsoAway.others })}{" "}
          <span className="whitespace-nowrap">{shortDates.range(alsoAway.start, alsoAway.end, { hideYear: true })}</span>
        </p>
      ) : null}

      {onApprove || onDecline ? (
        <div className="flex justify-end gap-2 pt-1">
          {onDecline ? (
            <Button type="button" variant="secondary" size="sm" onClick={onDecline}>
              {t("card.decline")}
            </Button>
          ) : null}
          {onApprove ? (
            <Button type="button" variant="approve" size="sm" onClick={onApprove}>
              {t("card.approve")}
            </Button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
};

/** ↗ in the card's corner, as an icon button the caller fills with its link or its dialog trigger. */
export const LeaveCardExpandIcon: FC = () => <Icon icon={ArrowExpand01Icon} size="sm" />;
