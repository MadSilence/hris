"use client";

import { useState } from "react";
import { useDebouncedValue } from "@/components/modules/organization/modules/profile/hooks/useDebouncedValue";
import { usePeopleSearch } from "@/components/modules/organization/hooks/usePeopleSearch";
import AssignedUsersTable from "./AssignedUsersTable";
import type { UsersSearchItemDTO } from "@/models/user/fields";

const PAGE_SIZE = 100;

export interface AssignedUsersModuleProps {
  roleId: string;
  isLoading?: boolean;
}

export default function AssignedUsersModule({ roleId, isLoading = false }: AssignedUsersModuleProps) {
  const [query, setQuery] = useState("");
  const debouncedQ = useDebouncedValue(query.trim(), 300);
  const qForApi = debouncedQ.length >= 2 ? debouncedQ : null;

  const { data, isLoading: usersLoading, error } = usePeopleSearch({
    limit: PAGE_SIZE,
    cursor: null,
    q: qForApi,
    sortField: "last_name",
    sortDir: "asc",
    selectedFields: null,
    filters: null,
  } as any);

  if (error) throw error;

  const rows: UsersSearchItemDTO[] = data?.items ?? [];
  const totalCount = (data as any)?.total ?? (data as any)?.totalCount ?? rows.length;
  const loading = isLoading || usersLoading;

  return (
    <AssignedUsersTable
      roleId={roleId}
      rows={rows}
      totalCount={totalCount}
      isLoading={loading}
      query={query}
      onQueryChange={setQuery}
      onExport={() => {
      }}
      onManageRules={() => {
      }}
      onRemoveUser={(userId) => {
      }}
    />
  );
}
