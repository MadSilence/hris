"use client";

import React, { useState } from "react";
import { ErrorState } from "@/components/feedback/ErrorState";
import { formatDisplayDate } from "@/lib/date";
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

const dates = (person: WhosOutPerson) =>
  person.startDate === person.endDate
    ? formatDisplayDate(person.startDate, { style: "medium", hideYear: true })
    : `${formatDisplayDate(person.startDate, { style: "medium", hideYear: true })} – ${formatDisplayDate(person.endDate, { style: "medium", hideYear: true })}`;

/**
 * Who is away (sitting 2, H6): the reader's team and department, or everyone; today, or the rest of the week.
 * "Away" is the server's answer — only on a day the person would have worked — and so is everything said about
 * the leave: a type the reader may not know arrives without a name or a colour and reads "Away" (SPEC § 13.13).
 */
export const WhosOutWidget: React.FC = () => {
  const [range, setRange] = useState<WhosOutRange>("TODAY");
  const [audience, setAudience] = useState<WhosOutAudience>("TEAM");
  const query = useWhosOut(range, audience);

  const empty = range === "TODAY" ? "Everyone's in today." : "Everyone's in for the rest of the week.";

  return (
    <HomeCard title="Who's out" action={<HomeCardLink href="/calendar">Open calendar</HomeCardLink>}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <HomeToggle<WhosOutAudience>
          label="Whose absences"
          value={audience}
          onChange={setAudience}
          options={[{ value: "TEAM", label: "My team" }, { value: "EVERYONE", label: "Everyone" }]}
        />
        <HomeToggle<WhosOutRange>
          label="When"
          value={range}
          onChange={setRange}
          options={[{ value: "TODAY", label: "Today" }, { value: "WEEK", label: "This week" }]}
        />
      </div>

      {query.isLoading ? (
        <HomeRowsSkeleton />
      ) : query.error || !query.data ? (
        <ErrorState error={query.error} compact onRetry={() => void query.refetch()} />
      ) : audience === "TEAM" && !query.data.hasTeam ? (
        <div className="flex flex-col items-start gap-2">
          <HomeEmpty>You are not in a team or a department yet.</HomeEmpty>
          <button type="button" className="text-body font-medium text-secondary hover:underline" onClick={() => setAudience("EVERYONE")}>
            Show everyone
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
              detail={dates(person)}
              aside={
                <div className="flex shrink-0 items-center gap-2">
                  {PENDING.has(person.status) && (
                    <StatusBadge status="pending" size="sm" />
                  )}
                  <span className="flex items-center gap-1.5 text-hint text-secondary">
                    <span aria-hidden className={cn("size-2 rounded-pill", TAG_CLASSES[toTagColor(person.leaveTypeColor)].dot)} />
                    {person.leaveTypeName ?? "Away"}
                  </span>
                </div>
              }
            />
          ))}
          {query.data.more > 0 && (
            <p className="pt-1 text-hint text-tertiary">And {query.data.more} more on the calendar.</p>
          )}
        </div>
      )}
    </HomeCard>
  );
};
