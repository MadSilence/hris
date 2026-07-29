"use client";

import { useState } from "react";
import { useDebouncedValue } from "@/components/modules/organization/modules/profile/hooks/useDebouncedValue";
import {
  useAssignedUsers,
  assignedUsersQueryKey,
} from "@/components/audience/assignment/hooks/useAssignedUsers";
import AssignedUsersPanel from "@/components/modules/settings/shared/AssignedUsersPanel/AssignedUsersPanel";
import type { Office } from "@/models/office";

const BASE_PATH = "/offices";

export default function OfficeAssignedUsersTab({ office }: { office: Office }) {
  const [query, setQuery] = useState("");
  const debounced = useDebouncedValue(query.trim(), 300);
  const q = debounced.length >= 2 ? debounced : "";

  const { items, total, isLoading, hasNextPage, isFetchingNextPage, fetchNextPage } =
    useAssignedUsers(BASE_PATH, office.id, q);

  return (
    <AssignedUsersPanel
      description="Everyone assigned to this office, managed in one place."
      manageResource="ORG.OFFICE"
      query={query}
      onQueryChange={setQuery}
      rows={items}
      total={total}
      isLoading={isLoading}
      hasMore={hasNextPage}
      isLoadingMore={isFetchingNextPage}
      onLoadMore={() => void fetchNextPage()}
      assign={{
        basePath: BASE_PATH,
        assignableId: office.id,
        assignableName: office.name,
        noun: "office",
        invalidateKeys: [assignedUsersQueryKey(BASE_PATH, office.id)],
      }}
    />
  );
}
