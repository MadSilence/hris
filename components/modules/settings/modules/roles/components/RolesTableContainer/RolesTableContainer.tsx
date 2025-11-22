"use client"

import RolesTable, { RoleRow } from "@/components/modules/settings/modules/roles/components/RolesTable/RolesTable";
import { useRoles } from "@/components/modules/settings/modules/roles/hooks/useRoles";
import React from "react";
import { Button } from "@/components/ui/Button";

const demo: RoleRow[] = [
  {id: "r1", name: "All employees", membersCount: 147, updatedAt: "2025-08-11", updatedBy: {id: "u1", name: "Petr Kastahlod"}},
  {id: "r2", name: "HR Manager", membersCount: 13, updatedAt: "2025-07-31", updatedBy: {id: "u1", name: "Petr Kastahlod"}},
  {id: "r3", name: "Line Manager", membersCount: 37, updatedAt: "2025-08-11", updatedBy: {id: "u1", name: "Petr Kastahlod"}},
];

const RolesTableContainer: React.FC = () => {
  const {
    data: roles,
    isLoading: rolesLoading,
    error: rolesError,
  } = useRoles();

  if (rolesError) {
    throw rolesError;
  }

  return <RolesTable rows={roles}
                     isLoading={rolesLoading}
                     actions={<Button>Create</Button>}
                     buildRoleHref={(id) => `/settings/roles/${id}`}/>
}

export default RolesTableContainer;
