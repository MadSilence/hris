"use client";

import React, { useState } from "react";
import Link from "next/link";
import { BirthdayCakeIcon, PartyPopperIcon, SparklesIcon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/desact/icon";
import { ErrorState } from "@/components/feedback/ErrorState";
import { useCanAccess } from "@/components/auth/useAccess";
import { formatDisplayDate } from "@/lib/date";
import type { Celebration, Celebrations } from "@/models/home";
import { useCelebrations } from "@/components/modules/home/hooks";
import {
  HomeCard,
  HomeEmpty,
  HomePersonRow,
  HomeRowsSkeleton,
  HomeToggle,
} from "@/components/modules/home/components/HomeCard";

const ICONS = { BIRTHDAY: BirthdayCakeIcon, ANNIVERSARY: PartyPopperIcon, NEW_JOINER: SparklesIcon } as const;

const what = (item: Celebration): string => {
  switch (item.kind) {
    case "BIRTHDAY":
      return "Birthday";
    case "ANNIVERSARY":
      return `${item.years} ${item.years === 1 ? "Year" : "Years"} at the company`;
    default:
      return "Joins the company";
  }
};

/** Today reads "Today"; a later day reads as day and month — never with a year, which a birthday must not carry. */
const when = (item: Celebration, today: string) =>
  item.date === today ? "Today" : formatDisplayDate(item.date, { style: "medium", hideYear: true });

/**
 * What the card says when a kind of row does not reach the reader. An administrator is told what to open;
 * everybody else is told nothing they could act on, which is nothing at all.
 */
const BirthdayNote: React.FC<{ data: Celebrations }> = ({ data }) => {
  const canChooseField = useCanAccess("SETTINGS.GENERAL", "EDIT");
  const canOpenAccess = useCanAccess("ROLES.ROLE", "EDIT");

  if (data.birthdays === "OFF" && canChooseField) {
    return (
      <p className="text-hint text-tertiary">
        Birthdays are off: no birthday field is chosen.{" "}
        <Link href="/settings/general/dashboard" className="font-medium text-accent-text underline-offset-4 hover:underline">Choose one</Link>
      </p>
    );
  }
  if (data.birthdays === "HIDDEN" && canOpenAccess) {
    return (
      <p className="text-hint text-tertiary">
        Birthdays are hidden from you: {data.birthdayFieldName ? `"${data.birthdayFieldName}"` : "the birthday field"} is
        not visible to your role for everyone. Grant it in field access to show birthdays here.{" "}
        <Link href="/settings/people/roles" className="font-medium text-accent-text underline-offset-4 hover:underline">Open roles</Link>
      </p>
    );
  }
  return null;
};

/**
 * Birthdays, work anniversaries and new joiners (sitting 2, H7 and H12): today, or the next seven days under
 * *Show Upcoming*. Nothing from the past. Each kind arrives only when the reader may see its field for everyone
 * — that is the server's rule; this card only says why a kind is missing.
 */
export const CelebrationsWidget: React.FC = () => {
  const [upcoming, setUpcoming] = useState(false);
  const query = useCelebrations(upcoming);

  return (
    <HomeCard
      title="Celebrations"
      action={
        <HomeToggle<"today" | "upcoming">
          label="When"
          value={upcoming ? "upcoming" : "today"}
          onChange={(next) => setUpcoming(next === "upcoming")}
          options={[{ value: "today", label: "Today" }, { value: "upcoming", label: "Show upcoming" }]}
        />
      }
    >
      {query.isLoading ? (
        <HomeRowsSkeleton />
      ) : query.error || !query.data ? (
        <ErrorState error={query.error} compact onRetry={() => void query.refetch()} />
      ) : (
        <>
          {query.data.items.length === 0 ? (
            <HomeEmpty>{upcoming ? "Nothing to celebrate this week." : "Nothing to celebrate today."}</HomeEmpty>
          ) : (
            <div className="flex flex-col gap-1">
              {query.data.items.map((item) => {
                const shownIcon = ICONS[item.kind];
                return (
                  <HomePersonRow
                    key={`${item.kind}-${item.userId}`}
                    firstName={item.firstName}
                    lastName={item.lastName}
                    avatarUrl={item.avatarUrl}
                    detail={what(item)}
                    aside={
                      <span className="flex shrink-0 items-center gap-1.5 text-hint text-secondary">
                        <Icon icon={shownIcon} size="sm" className="text-tertiary" />
                        {when(item, query.data.from)}
                      </span>
                    }
                  />
                );
              })}
            </div>
          )}
          <BirthdayNote data={query.data} />
        </>
      )}
    </HomeCard>
  );
};
