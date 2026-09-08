"use client";

import React, { ReactNode } from "react";
import { Skeleton } from "@/public/desact/src/components/ui/skeleton";
import { AccessAction, AccessCheck, AccessScope, ResourceCode } from "@/models/access";
import { PermissionGate } from "./PermissionGate";
import { AccessDenied } from "./AccessDenied";

/**
 * `PermissionGate` for a whole page, which needs a different default from `PermissionGate` for a
 * button.
 *
 * Two of the gate's props were repeated at every page in the app and one was repeatedly omitted:
 *
 * - `fallback={<AccessDenied/>}` was written out twenty-odd times, which is fine until one page
 *   forgets it and silently renders nothing to somebody who lacks the right.
 * - **`loadingFallback` was never passed anywhere**, and its default is `null`. So between the first
 *   paint and the arrival of `/me/access` every page in the product was an empty `main` inside a
 *   live shell — sidebar, navigation, no content, no spinner, no border. That is the
 *   "detail page renders an empty `main`" of the 2026-08-28 run, and it was never about that page.
 *
 * Inline gates keep the old defaults on purpose: a spinner where a button should be is worse than a
 * gap, and a row action that renders nothing until permissions land is correct.
 */
export const PageGate: React.FC<{
  children: ReactNode;
  resource?: ResourceCode;
  action?: AccessAction;
  scope?: AccessScope;
  anyOf?: AccessCheck[];
  allOf?: AccessCheck[];
  /** Overrides the refusal screen. Defaults to the full-page 403. */
  fallback?: ReactNode;
}> = ({ children, fallback, ...checks }) => (
  <PermissionGate
    {...checks}
    fallback={fallback ?? <AccessDenied/>}
    loadingFallback={<PageGateSkeleton/>}
  >
    {children}
  </PermissionGate>
);

/**
 * Deliberately generic. The gate does not know what the page below it looks like, and a skeleton
 * that guesses wrong reads worse than one that plainly says "something is coming" — a heading-sized
 * bar, a line of text, and a block.
 */
const PageGateSkeleton: React.FC = () => (
  <div className="flex flex-col gap-4 p-6" aria-busy="true" aria-live="polite">
    <span className="sr-only">Checking your access…</span>
    <Skeleton className="h-7 w-56"/>
    <Skeleton className="h-4 w-80"/>
    <Skeleton className="h-64 w-full rounded-xl"/>
  </div>
);
