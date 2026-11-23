"use client";

import { forwardRef, type ButtonHTMLAttributes, type CSSProperties } from "react";
import { useTranslations } from "next-intl";
import { Clock01Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/desact/icon";
import { cn } from "@/lib/cn";
import { useShortDates } from "@/lib/date";
import { formatDayAmount } from "@/models/timeOff/formatDayAmount";
import { leaveVars } from "@/lib/theme/leave";
import type { CompanyCalendarAbsence } from "@/models/calendar";
import type { PillSuffix } from "@/components/modules/calendar/lib/leaveText";

/** Narrower than this, a pill is colour only (N01: "a pill too short for text is colour only"). */
export const PILL_TEXT_MIN_W = 44;

/** Still being decided — drawn white under a dashed edge, with the clock. */
export const isUndecided = (a: Pick<CompanyCalendarAbsence, "status">): boolean => a.status !== "APPROVED";

/**
 * A pill in its policy's leave colour (K01, `lib/theme/leave.ts`) — in gray, "Away", when the policy was not sent: a
 * masked pill tinted with its colour would still name the type to anyone who has learnt the colour.
 *
 *   approved   the fill, the words in the text colour
 *   pending    white, a 1.5 px dashed edge in the edge colour, the words in the text colour, Clock 14 first
 *
 * The difference is never the colour alone: the dashes and the clock say it too.
 */
export const leavePillStyle = (a: Pick<CompanyCalendarAbsence, "status" | "policyColor">): CSSProperties => {
  const leave = leaveVars(a.policyColor);
  if (!isUndecided(a)) return { backgroundColor: leave.fill, color: leave.text };
  return { backgroundColor: "var(--surface-card)", border: `1.5px dashed ${leave.edge}`, color: leave.text };
};

/** A pill's name: its policy (the colour is the policy's, D2), or "Away" when the reader may not know it. */
export const useLeaveName = () => {
  const t = useTranslations("calendar");
  return (a: Pick<CompanyCalendarAbsence, "policyName" | "leaveTypeName">): string =>
    a.policyName ?? a.leaveTypeName ?? t("board.away");
};

/** The pill's second part in words — "9 days", "back Mon 4 Jan", "Wed 18 – Thu 19 Nov". */
export const usePillSuffixText = () => {
  const t = useTranslations("calendar");
  const shortDates = useShortDates();
  return (suffix: PillSuffix): string | null => {
    switch (suffix.kind) {
      case "back":
        return t("pill.back", { date: shortDates.date(suffix.date, { weekday: true, hideYear: true }) });
      case "amount":
        return suffix.unit === "HOURS"
          ? t("pill.hours", { count: suffix.amount, amount: formatDayAmount(suffix.amount) })
          : suffix.working
            ? t("pill.workingDays", { count: suffix.amount, amount: formatDayAmount(suffix.amount) })
            : t("pill.days", { count: suffix.amount, amount: formatDayAmount(suffix.amount) });
      case "dates":
        return shortDates.range(suffix.start, suffix.end, { weekday: true, hideYear: true });
      default:
        return null;
    }
  };
};

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  absence: Pick<CompanyCalendarAbsence, "status" | "policyColor" | "policyName" | "leaveTypeName">;
  /** "· 9 days" and the like, already in words; null says the name alone. */
  suffix: string | null;
  /** The leave started before the first loaded day: a square left end, a 40 px fade, the words 44 px in. */
  continuesLeft?: boolean;
  /** It goes on past the last loaded day: a square right end and an arrow after "back …". */
  continuesRight?: boolean;
  /** The pill's width, to drop the words when they cannot fit. */
  width: number;
};

/**
 * One leave on a calendar (`hris/design/screens/company-calendar`, N01–N03): 28 high, radius full, "Annual leave ·
 * 5 days" in 12/16 500 with the second part 400. Hover lifts it — a white 2 px ring and a soft shadow, never a dark
 * outline — and there is **no tooltip**: a click opens the leave card. Shared by the company board and the profile's
 * calendar.
 */
export const LeavePill = forwardRef<HTMLButtonElement, Props>(function LeavePill(
  { absence, suffix, continuesLeft = false, continuesRight = false, width, className, style, ...rest },
  ref,
) {
  const name = useLeaveName()(absence);
  const words = width >= PILL_TEXT_MIN_W;
  const undecided = isUndecided(absence);
  return (
    <button
      ref={ref}
      type="button"
      data-status={absence.status}
      aria-label={suffix ? `${name} · ${suffix}` : name}
      style={{ ...leavePillStyle(absence), ...style }}
      className={cn(
        "relative flex h-7 min-w-0 items-center gap-1.5 overflow-hidden rounded-pill px-2.5 text-left text-hint font-medium whitespace-nowrap",
        "outline-none transition-shadow hover:z-20 hover:shadow-popover hover:ring-2 hover:ring-card focus-visible:shadow-focus",
        continuesLeft && "rounded-l-none pl-11",
        continuesRight && "rounded-r-none",
        className,
      )}
      {...rest}
    >
      {continuesLeft ? (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-0 w-10"
          style={{ backgroundImage: "linear-gradient(to right, var(--surface-card), transparent)" }}
        />
      ) : null}
      {words && undecided ? <Icon icon={Clock01Icon} size="sm" className="size-3.5 shrink-0" /> : null}
      {words ? (
        <span className="min-w-0 truncate">
          {name}
          {suffix ? <span className="font-normal">{` · ${suffix}`}{continuesRight ? " →" : ""}</span> : null}
        </span>
      ) : null}
    </button>
  );
});
