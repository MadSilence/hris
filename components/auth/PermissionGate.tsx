"use client";

import React, { ReactNode } from "react";
import { AccessAction, AccessCheck, AccessScope, canAccess, ResourceCode } from "@/models/access";
import { useAccess } from "./useAccess";

type Props = {
  children: ReactNode;
  resource?: ResourceCode;
  action?: AccessAction;
  scope?: AccessScope;
  anyOf?: AccessCheck[];
  allOf?: AccessCheck[];
  fallback?: ReactNode;
  loadingFallback?: ReactNode;
};

export const PermissionGate: React.FC<Props> = ({
  children,
  resource,
  action = "VIEW",
  scope,
  anyOf,
  allOf,
  fallback = null,
  loadingFallback = null,
}) => {
  const { access, loading } = useAccess();

  if (loading) {
    return <>{loadingFallback}</>;
  }

  let allowed = true;

  if (resource) {
    allowed = canAccess({ access, resource, action, scope });
  }

  if (allowed && anyOf && anyOf.length > 0) {
    allowed = anyOf.some((check) => canAccess({ access, ...check }));
  }

  if (allowed && allOf && allOf.length > 0) {
    allowed = allOf.every((check) => canAccess({ access, ...check }));
  }

  if (!allowed) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};
