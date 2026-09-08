"use client";

import * as React from "react";

import { useUser } from "@/components/hooks/useUser/useUser";
import { AccessDenied } from "@/components/auth/AccessDenied";
import { ErrorState } from "@/components/feedback/ErrorState";
import { ForbiddenError } from "@/components/clients/exceptions";
import type { ResourceCode } from "@/models/access";

type Props = {
  userId: string;
  resource: ResourceCode;
  action?: "VIEW" | "EDIT" | "MANAGE";
  children: React.ReactNode;
};

/**
 * Gates a profile tab on what the caller may do **to this person**, as resolved by the server.
 *
 * `PermissionGate` answers a different question — "does this actor hold the permission anywhere" —
 * and that let a SELF-scoped employee open any colleague's Documents or Time Off tab and find it
 * empty: no leak, since the data endpoints refuse, but a page that looks broken instead of closed.
 * Hiding the tab in the nav fixed the common path only; a typed URL still arrived here.
 *
 * The answer is not derived locally on purpose. "Which of my scopes reach this person" is scope
 * resolution, and a second copy of the permission model in the client is what `hris/CLAUDE.md`
 * § "Security model" exists to prevent. This is still UX, not enforcement: the endpoints behind the
 * tab do their own checking, as they must.
 */
export function ProfileCapabilityGate({ userId, resource, action = "VIEW", children }: Props) {
  const { data: user, error } = useUser(userId);

  // A refusal is an answer and gets the refusal screen; anything else is a failure and says so.
  // Without this the tab was blank forever whenever the lookup failed — the same silence as
  // "still loading", with nothing coming.
  if (error instanceof ForbiddenError) return <AccessDenied compact/>;
  if (error) return <ErrorState error={error} compact/>;

  // The profile is server-rendered with the user already in the SWR cache, so this is a lookup
  // rather than a fetch; while it is genuinely absent, render nothing rather than flashing a
  // refusal that may turn out to be wrong.
  if (!user) return null;

  const allowed = (user.capabilities?.[resource] ?? []).includes(action);
  // Compact, because this gate guards a **tab** and not a page. The smoke run of 2026-09-08 found
  // the full-page 403 rendering under the person's own header, offering "Back to dashboard" to
  // somebody who is standing on a profile with three other tabs they may read.
  return allowed ? <>{children}</> : <AccessDenied compact/>;
}
