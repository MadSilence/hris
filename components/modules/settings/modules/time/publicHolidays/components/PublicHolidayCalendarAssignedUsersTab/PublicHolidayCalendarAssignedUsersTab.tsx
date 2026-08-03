"use client";

import { useState } from "react";
import { useDebouncedValue } from "@/components/modules/organization/modules/profile/hooks/useDebouncedValue";
import {
  useAssignedUsers,
  assignedUsersQueryKey,
} from "@/components/audience/assignment/hooks/useAssignedUsers";
import AssignedUsersPanel from "@/components/modules/settings/shared/AssignedUsersPanel/AssignedUsersPanel";
import { Badge } from "@/public/desact/src/components/ui/badge";

const BASE_PATH = "/public-holiday-calendars";

type Props = {
  calendarId: string;
  calendarName: string;
};

export function PublicHolidayCalendarAssignedUsersTab({ calendarId, calendarName }: Props) {
  const [query, setQuery] = useState("");
  const debounced = useDebouncedValue(query.trim(), 300);
  const q = debounced.length >= 2 ? debounced : "";

  const { items, total, isLoading, hasNextPage, isFetchingNextPage, fetchNextPage } =
    useAssignedUsers(BASE_PATH, calendarId, q);

  return (
    <AssignedUsersPanel
      title="Assigned people"
      description="People who have this holiday calendar assigned to them."
      manageResource="ORG.PUBLIC_HOLIDAY_CALENDAR"
      fillParent
      query={query}
      onQueryChange={setQuery}
      rows={items}
      total={total}
      isLoading={isLoading}
      hasMore={hasNextPage}
      isLoadingMore={isFetchingNextPage}
      onLoadMore={() => void fetchNextPage()}
      secondaryColumn={{
        header: "Holiday Calendars",
        render: (u) =>
          u.calendars && u.calendars.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {u.calendars.map((c) => (
                <Badge key={c.id} variant="secondary" className="font-normal">
                  {c.name}
                </Badge>
              ))}
            </div>
          ) : (
            <span className="text-muted-foreground">—</span>
          ),
      }}
      assign={{
        basePath: BASE_PATH,
        assignableId: calendarId,
        assignableName: calendarName,
        noun: "calendar",
        semantics: "add",
        invalidateKeys: [assignedUsersQueryKey(BASE_PATH, calendarId)],
      }}
    />
  );
}
