"use client";

import { useMemo } from "react";
import { useRoles } from "@/components/modules/settings/modules/roles/hooks/useRoles";
import RoleDetailsView from "./RoleDetailsView";

export interface RoleDetailsContainerProps {
  roleId: string;
}

export default function RoleDetailsContainer({ roleId }: RoleDetailsContainerProps) {
  const { data: roles, isLoading, error } = useRoles();

  if (error) throw error;

  const role = useMemo(() => (roles ?? []).find((r) => r.id === roleId), [roles, roleId]);

  return <RoleDetailsView roleId={roleId} isLoading={isLoading}/>;
}
