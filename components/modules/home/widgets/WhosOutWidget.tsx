"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { ErrorState } from "@/components/feedback/ErrorState";
import { type DateFormatter, useDateFormatter } from "@/lib/date";
import type { WhosOutAudience, WhosOutPerson, WhosOutRange } from "@/models/home";
import { useWhosOut } from "@/components/modules/home/hooks";
import {
  HomeCard,
  HomeCardLink,
  HomeEmpty,
  HomePersonRow,
  HomeRowsSkeleton,
  HomeToggle,
} from "@/components/modules/home/components/HomeCard";
import { cn } from "@/lib/cn";
import { TAG_CLASSES, toTagColor } from "@/lib/theme/tags";
import { StatusBadge } from "@/components/ui/StatusBadge";

const PENDING = new Set(["PENDING", "CANCELLATION_PENDING"]);

const dates = (person: WhosOutPerson, formatDisplayDate: DateFormatter) =>
  person.startDate === person.endDate
    ? formatDisplayDate(person.startDate, { style: "medium", hideYear: true })
    : `${formatDisplayDate(person.startDate, { style: "medium", hideYear: true })} – ${formatDisplayDate(person.endDate, { style: "medium", hideYear: true })}`;

/**
 * Who is away (sitting 2, H6): the reader's team and department, or everyone; today, or the rest of the week.
 * "Away" is the server's answer — only on a day the person would have worked — and so is everything said about
 * the leave: a type the reader may not know arrives without a name or a colour and reads "Away" (SPEC § 13.13).
 */
export const WhosOutWidget: React.FC = () => {
  const t = useTranslations("home");
  const formatDisplayDate = useDateFormatter();
  const [range, setRange] = useState<WhosOutRange>("TODAY");
  const [audience, setAudience] = useState<WhosOutAudience>("TEAM");
  const query = useWhosOut(range, audience);

  const empty = range === "TODAY" ? t("whosOut.emptyToday") : t("whosOut.emptyWeek");

  return (
    <HomeCard title={t("widgets.whosOut.title")} action={<HomeCardLink href="/calendar">{t("whosOut.openCalendar")}</HomeCardLink>}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <HomeToggle<WhosOutAudience>
          label={t("whosOut.whose")}
          value={audience}
          onChange={setAudience}
          options={[{ value: "TEAM", label: t("whosOut.myTeam") }, { value: "EVERYONE", label: t("whosOut.everyone") }]}
        />
        <HomeToggle<WhosOutRange>
          label={t("card.when")}
          value={range}
          onChange={setRange}
          options={[{ value: "TODAY", label: t("card.today") }, { value: "WEEK", label: t("whosOut.thisWeek") }]}
        />
      </div>

      {query.isLoading ? (
        <HomeRowsSkeleton />
      ) : query.error || !query.data ? (
        <ErrorState error={query.error} compact onRetry={() => void query.refetch()} />
      ) : audience === "TEAM" && !query.data.hasTeam ? (
        <div className="flex flex-col items-start gap-2">
          <HomeEmpty>{t("whosOut.noTeam")}</HomeEmpty>
          <button type="button" className="text-body font-medium text-secondary hover:underline" onClick={() => setAudience("EVERYONE")}>
            {t("whosOut.showEveryone")}
          </button>
        </div>
      ) : query.data.people.length === 0 ? (
        <HomeEmpty>{empty}</HomeEmpty>
      ) : (
        <div className="flex flex-col gap-1">
          {query.data.people.map((person) => (
            <HomePersonRow
              key={`${person.userId}-${person.startDate}`}
              firstName={person.firstName}
              lastName={person.lastName}
              avatarUrl={person.avatarUrl}
              href={person.requestId ? `/time-off/requests/${person.requestId}` : null}
              detail={dates(person, formatDisplayDate)}
              aside={
                <div className="flex shrink-0 items-center gap-2">
                  {PENDING.has(person.status) && (
                    <StatusBadge status="pending" size="sm" />
                  )}
                  <span className="flex items-center gap-1.5 text-hint text-secondary">
                    <span aria-hidden className={cn("size-2 rounded-pill", TAG_CLASSES[toTagColor(person.leaveTypeColor)].dot)} />
                    {person.leaveTypeName ?? t("whosOut.away")}
                  </span>
                </div>
              }
            />
          ))}
          {query.data.more > 0 && (
            <p className="pt-1 text-hint text-tertiary">{t("whosOut.more", { count: query.data.more })}</p>
          )}
        </div>
      )}
    </HomeCard>
  );
};
