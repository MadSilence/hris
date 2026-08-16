"use client";

import { useMemo } from "react";
import { useRoles } from "@/components/modules/settings/modules/roles/hooks/useRoles";
import RoleDetailsView from "./RoleDetailsView";
import { AccessDenied } from "@/components/auth/AccessDenied";
import { ForbiddenError } from "@/components/clients/exceptions";

export interface RoleDetailsContainerProps {
  roleId: string;
}

export default function RoleDetailsContainer({ roleId }: RoleDetailsContainerProps) {
  const { data: roles, isLoading, error } = useRoles();
  if (error && !(error instanceof ForbiddenError)) throw error;

  const role = useMemo(() => (roles ?? []).find((r) => r.id === roleId), [roles, roleId]);

  // Below the hooks: an early return above them would render fewer hooks than the previous pass.
  if (error instanceof ForbiddenError) return <AccessDenied/>;

  return (
    <RoleDetailsView
      roleId={roleId}
      roleName={role?.name}
      isDefaultRole={role?.isDefault ?? false}
      isArchived={role?.archived ?? false}
      isLoading={isLoading}
    />
  );
}
