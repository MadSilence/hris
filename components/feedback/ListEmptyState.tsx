"use client";

import * as React from "react";
import { AccessAction, ResourceCode } from "@/models/access";
import { PermissionGate } from "@/components/auth/PermissionGate";
import { EmptyState, NoResults } from "@/components/feedback/EmptyState";

/**
 * Picks which of the three empty screens a list is actually in.
 *
 * `technical_documentation/ui/TABLES_AND_LISTS.md` § 3 says these are three different screens that
 * must not share a rendering, and every list therefore has to answer the same question in the same
 * order: *did the search miss, am I looking at an empty archive, or does nothing exist yet?*
 *
 * **Writing that ladder at each of the twenty list surfaces is how it drifts** — the audit found six
 * empty-state treatments and several screens that showed "no results" when the truth was "nothing
 * here yet", which reads as an invitation to search harder for a record that was never created.
 * Getting the order wrong is silent: every branch renders something plausible.
 *
 * The order is not arbitrary. **Search is checked first**, because a query that matches nothing is
 * true whether or not the underlying list is empty, and it is the more useful thing to say.
 */
export const ListEmptyState: React.FC<{
  /** The current search text. Anything non-blank selects the no-results screen. */
  query?: string;
  /** True while the list is showing the archived view. */
  archivedView?: boolean;
  icon: React.ReactNode;
  /** The nothing-yet heading: "No legal entities yet". */
  title: string;
  /** The nothing-yet sentence. Say what the thing is for, not that the list is empty. */
  description: string;
  /** "Try a different name, country or registration number." */
  noResultsHint?: string;
  /** The archived view's sentence. Defaults to a plain one. */
  archivedDescription?: string;
  onCreate?: () => void;
  createLabel?: string;
  /**
   * The permission the create action needs. Without it the same block renders, minus the create
   * affordance — the second rule of `technical_documentation/ui/README.md`: a control that cannot
   * work is not offered.
   *
   * The gate lives here rather than inside {@link EmptyState} so that component stays a leaf. It
   * reads permissions through react-query, and a shared presentational piece that cannot render
   * outside a `QueryClientProvider` is a piece every test then has to work around — which is exactly
   * what three suites reported when the hook was tried there.
   */
  createAccess?: { resource: ResourceCode; action?: AccessAction };
  /** A control to render in place of the clickable block — see {@link EmptyState}. */
  action?: React.ReactNode;
  className?: string;
}> = ({
  query,
  archivedView,
  icon,
  title,
  description,
  noResultsHint,
  archivedDescription = "Archived records will appear here.",
  onCreate,
  createLabel,
  createAccess,
  action,
  className,
}) => {
  if (query?.trim()) {
    return <NoResults hint={noResultsHint} className={className} />;
  }

  // No create action here on purpose: the archive is filled by archiving, never by creating.
  if (archivedView) {
    return (
      <EmptyState
        icon={icon}
        title="Nothing archived"
        description={archivedDescription}
        className={className}
      />
    );
  }

  const common = { icon, title, description, action, className };

  if (createAccess && onCreate) {
    return (
      <PermissionGate
        resource={createAccess.resource}
        action={createAccess.action ?? "EDIT"}
        fallback={<EmptyState {...common} />}
      >
        <EmptyState {...common} onCreate={onCreate} createLabel={createLabel} />
      </PermissionGate>
    );
  }

  return <EmptyState {...common} onCreate={onCreate} createLabel={createLabel} />;
};
