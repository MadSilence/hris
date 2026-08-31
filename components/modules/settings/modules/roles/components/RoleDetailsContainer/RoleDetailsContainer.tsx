"use client";

import { ErrorState } from "@/components/feedback/ErrorState";
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

  const role = useMemo(() => (roles ?? []).find((r) => r.id === roleId), [roles, roleId]);

  // Below the hooks: an early return above them would render fewer hooks than the previous pass.
  // Below every hook on purpose: an early return above them would change how many hooks
  // this render calls. A failed read is still an answer, so it gets a region, not a crash.
  if (error instanceof ForbiddenError) return <AccessDenied/>;
  if (error) return <ErrorState error={error} />;

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
