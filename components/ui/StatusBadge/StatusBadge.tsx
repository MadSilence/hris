"use client";

import * as React from "react";
import { Badge } from "@/public/desact/src/components/ui/badge";

/**
 * The one status chip.
 *
 * Five files carried a private `statusBadge(status)` returning the same `{ label, className }` for
 * the same four states, and they had already started to drift: the leave-type one has no Draft, the
 * calendar ones call the neutral state Inactive and the policy ones call it Draft, and each list
 * spelled the archived colour out by hand. **A vocabulary held in five places is a vocabulary that
 * will disagree in five places**, and the archive work is what makes that visible — every one of
 * those screens now has to say the same thing about the same state.
 *
 * The state names are the product's, not any one entity's schema: an entity maps its own enum onto
 * these four. That mapping is the only thing a caller should have to write.
 */
export type EntityStatus = "active" | "inactive" | "draft" | "archived";

const STYLES: Record<EntityStatus, { label: string; className: string }> = {
  active: { label: "Active", className: "border-green-200 bg-green-50 text-green-700" },
  // Deliberately the same amber as a warning rather than the red of a failure: archived is a
  // reversible state somebody chose, not something that went wrong.
  archived: { label: "Archived", className: "border-amber-200 bg-amber-50 text-amber-700" },
  inactive: { label: "Inactive", className: "" },
  draft: { label: "Draft", className: "" },
};

export const StatusBadge: React.FC<{
  status: EntityStatus;
  /** Overrides the word only. The colour stays tied to the state. */
  label?: string;
  className?: string;
}> = ({ status, label, className }) => {
  const style = STYLES[status];

  return (
    <Badge variant="outline" className={`${style.className} ${className ?? ""}`.trim()}>
      {label ?? style.label}
    </Badge>
  );
};
