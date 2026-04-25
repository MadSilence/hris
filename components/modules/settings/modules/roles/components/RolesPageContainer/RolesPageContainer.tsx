"use client";

import React from "react";
import { useRoles } from "@/components/modules/settings/modules/roles/hooks/useRoles";
import { usePeopleSearch } from "@/components/modules/organization/hooks/usePeopleSearch";
import RolesPageView from "./RolesPageView";

const PAGE_SIZE = 50;

const RolesPageContainer: React.FC = () => {
  const { data: roles, isLoading: rolesLoading, error: rolesError } = useRoles();

  const {
    data: people,
    isLoading: usersLoading,
    error: peopleError,
  } = usePeopleSearch({
    limit: PAGE_SIZE,
    cursor: null,
    q: "",
    sortField: "last_name",
    sortDir: "asc",
    selectedFields: null,
    filters: null,
  } as any);

  if (rolesError) throw rolesError;
  if (peopleError) throw peopleError;

  return (
    <RolesPageView
      roleRows={roles}
      userRows={people?.items}
      rolesLoading={rolesLoading}
      usersLoading={usersLoading}
    />
  );
};

export default RolesPageContainer;
