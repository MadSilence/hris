"use client";

import React, { ReactNode } from "react";
import { AccessAction, AccessCheck, AccessScope, canAccess, ResourceCode } from "@/models/access";
import { useAccess } from "./useAccess";
import { ErrorState } from "@/components/feedback/ErrorState";

type Props = {
  children: ReactNode;
  resource?: ResourceCode;
  action?: AccessAction;
  scope?: AccessScope;
  anyOf?: AccessCheck[];
  allOf?: AccessCheck[];
  fallback?: ReactNode;
  loadingFallback?: ReactNode;
  /**
   * Shown when the permissions could not be fetched at all. Defaults to the region-level error
   * rather than `fallback`: "you do not have permission" is a claim, and we have no grounds for it
   * when the answer never arrived.
   */
  unavailableFallback?: ReactNode;
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
  unavailableFallback,
}) => {
  const { access, loading, unavailable, error } = useAccess();

  if (loading) {
    return <>{loadingFallback}</>;
  }

  if (unavailable) {
    return (
      <>
        {/*
          A full reload, not a refetch. Verifying the token needs the backend's signing key, and the
          JWKS client caches that lookup inside the Next process — including its failure. A
          client-side refetch keeps hitting the poisoned cache and the button does nothing, which the
          smoke run of 2026-08-27 caught. Reloading gets a fresh process-side attempt.
        */}
        {unavailableFallback ?? <ErrorState error={error} title="Permissions did not load" />}
      </>
    );
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
