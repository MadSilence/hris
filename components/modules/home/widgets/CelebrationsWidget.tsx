"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { BirthdayCakeIcon, PartyPopperIcon, SparklesIcon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/desact/icon";
import { ErrorState } from "@/components/feedback/ErrorState";
import { useCanAccess } from "@/components/auth/useAccess";
import { type DateFormatter, useDateFormatter } from "@/lib/date";
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

type HomeTranslator = ReturnType<typeof useTranslations<"home">>;

const what = (item: Celebration, t: HomeTranslator): string => {
  switch (item.kind) {
    case "BIRTHDAY":
      return t("celebrations.birthday");
    case "ANNIVERSARY":
      return t("celebrations.anniversary", { count: item.years ?? 0 });
    default:
      return t("celebrations.joins");
  }
};

/** Today reads "Today"; a later day reads as day and month — never with a year, which a birthday must not carry. */
const when = (item: Celebration, today: string, t: HomeTranslator, formatDisplayDate: DateFormatter) =>
  item.date === today ? t("card.today") : formatDisplayDate(item.date, { style: "medium", hideYear: true });

/**
 * What the card says when a kind of row does not reach the reader. An administrator is told what to open;
 * everybody else is told nothing they could act on, which is nothing at all.
 */
const BirthdayNote: React.FC<{ data: Celebrations }> = ({ data }) => {
  const t = useTranslations("home");
  const canChooseField = useCanAccess("SETTINGS.GENERAL", "EDIT");
  const canOpenAccess = useCanAccess("ROLES.ROLE", "EDIT");

  if (data.birthdays === "OFF" && canChooseField) {
    return (
      <p className="text-hint text-tertiary">
        {t("celebrations.birthdaysOff")}{" "}
        <Link href="/settings/general/dashboard" className="font-medium text-accent-text underline-offset-4 hover:underline">{t("celebrations.chooseOne")}</Link>
      </p>
    );
  }
  if (data.birthdays === "HIDDEN" && canOpenAccess) {
    return (
      <p className="text-hint text-tertiary">
        {t("celebrations.birthdaysHidden", { hasField: data.birthdayFieldName ? "yes" : "no", field: data.birthdayFieldName ?? "" })}{" "}
        <Link href="/settings/people/roles" className="font-medium text-accent-text underline-offset-4 hover:underline">{t("celebrations.openRoles")}</Link>
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
  const t = useTranslations("home");
  const formatDisplayDate = useDateFormatter();
  const [upcoming, setUpcoming] = useState(false);
  const query = useCelebrations(upcoming);

  return (
    <HomeCard
      title={t("widgets.celebrations.title")}
      action={
        <HomeToggle<"today" | "upcoming">
          label={t("card.when")}
          value={upcoming ? "upcoming" : "today"}
          onChange={(next) => setUpcoming(next === "upcoming")}
          options={[{ value: "today", label: t("card.today") }, { value: "upcoming", label: t("celebrations.showUpcoming") }]}
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
            <HomeEmpty>{upcoming ? t("celebrations.emptyWeek") : t("celebrations.emptyToday")}</HomeEmpty>
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
                    detail={what(item, t)}
                    aside={
                      <span className="flex shrink-0 items-center gap-1.5 text-hint text-secondary">
                        <Icon icon={shownIcon} size="sm" className="text-tertiary" />
                        {when(item, query.data.from, t, formatDisplayDate)}
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
