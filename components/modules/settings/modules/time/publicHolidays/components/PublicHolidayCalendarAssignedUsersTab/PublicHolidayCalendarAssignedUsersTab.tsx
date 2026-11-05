"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useDebouncedValue } from "@/components/modules/organization/modules/profile/hooks/useDebouncedValue";
import {
  useAssignedUsers,
  assignedUsersQueryKey,
} from "@/components/audience/assignment/hooks/useAssignedUsers";
import AssignedUsersPanel from "@/components/modules/settings/shared/AssignedUsersPanel/AssignedUsersPanel";
import { Badge } from "@/components/desact/badge";

const BASE_PATH = "/public-holiday-calendars";

type Props = {
  calendarId: string;
  calendarName: string;
  /** An archived calendar takes nobody new — the engine refuses it, so the button says so first. */
  isArchived?: boolean;
};

export function PublicHolidayCalendarAssignedUsersTab({ calendarId, calendarName, isArchived }: Props) {
  const t = useTranslations("timeOff");
  const [query, setQuery] = useState("");
  const debounced = useDebouncedValue(query.trim(), 300);
  const q = debounced.length >= 2 ? debounced : "";

  const { items, total, limited, isLoading, error, hasNextPage, isFetchingNextPage, fetchNextPage } =
    useAssignedUsers(BASE_PATH, calendarId, q);

  return (
    <AssignedUsersPanel
      title={t("publicHolidays.assigned.title")}
      description={t("publicHolidays.assigned.description")}
      manageResource="ORG.PUBLIC_HOLIDAY_CALENDAR"
      // The resource has VIEW and MANAGE and no EDIT, so the panel's default EDIT gate hid Assign and
      // Unassign from everybody, including the people the backend lets do both.
      manageAction="MANAGE"
      fillParent
      query={query}
      onQueryChange={setQuery}
      rows={items}
      total={total}
        limited={limited}
      isLoading={isLoading}
      error={error}
      isArchived={isArchived}
      hasMore={hasNextPage}
      isLoadingMore={isFetchingNextPage}
      onLoadMore={() => void fetchNextPage()}
      secondaryColumn={{
        header: t("publicHolidays.assigned.column"),
        render: (u) =>
          u.calendars && u.calendars.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {u.calendars.map((c) => (
                <Badge key={c.id} variant="neutral" className="font-normal">
                  {c.name}
                </Badge>
              ))}
            </div>
          ) : (
            null
          ),
      }}
      assign={{
        basePath: BASE_PATH,
        assignableId: calendarId,
        assignableName: calendarName,
        kind: "calendar",
        semantics: "add",
        invalidateKeys: [assignedUsersQueryKey(BASE_PATH, calendarId)],
      }}
    />
  );
}
