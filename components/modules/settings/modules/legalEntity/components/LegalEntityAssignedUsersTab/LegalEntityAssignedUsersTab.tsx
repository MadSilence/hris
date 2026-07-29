"use client";

import { useState } from "react";
import { useDebouncedValue } from "@/components/modules/organization/modules/profile/hooks/useDebouncedValue";
import {
  useAssignedUsers,
  assignedUsersQueryKey,
} from "@/components/audience/assignment/hooks/useAssignedUsers";
import AssignedUsersPanel from "@/components/modules/settings/shared/AssignedUsersPanel/AssignedUsersPanel";
import type { LegalEntity } from "@/models/legalEntity";

const BASE_PATH = "/legal-entities";

export default function LegalEntityAssignedUsersTab({ entity }: { entity: LegalEntity }) {
  const [query, setQuery] = useState("");
  const debounced = useDebouncedValue(query.trim(), 300);
  const q = debounced.length >= 2 ? debounced : "";

  const { items, total, isLoading, hasNextPage, isFetchingNextPage, fetchNextPage } =
    useAssignedUsers(BASE_PATH, entity.id, q);

  return (
    <AssignedUsersPanel
      description="Everyone assigned to this legal entity, managed in one place."
      manageResource="ORG.LEGAL_ENTITY"
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
        assignableId: entity.id,
        assignableName: entity.name,
        noun: "legal entity",
        invalidateKeys: [assignedUsersQueryKey(BASE_PATH, entity.id)],
      }}
    />
  );
}
