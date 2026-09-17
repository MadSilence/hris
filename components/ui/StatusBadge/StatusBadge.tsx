"use client";

import * as React from "react";
import { Badge } from "@/public/desact/src/components/ui/badge";
import { formatAccountStatus, formatUserStatus, isActiveStatus, isProspectiveStatus } from "@/models/user/status";

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

/**
 * Semantic tokens, not raw Tailwind.
 *
 * The design system defines `success-*` / `danger-*` / `warning-*` in `globals.css` and, at the time
 * of the audit, **not one component used them** — all ~300 semantic colours in the app were raw
 * `green-500` / `red-500` / `amber-500`. The values are currently identical, so nothing looks wrong
 * today, **and that is the trap**: under a tenant palette the brown chrome moves and every status
 * colour stays put. Rule: `technical_documentation/ui/STATUS_AND_BADGES.md` § 3.
 */
const STYLES: Record<EntityStatus, { label: string; className: string }> = {
  active: { label: "Active", className: "border-success-200 bg-success-50 text-success-700" },
  /*
   * Grey, not amber. Archived is **not a warning** — it is a state somebody chose, reversible by
   * decision — and colouring it amber puts it in the same visual class as "something needs
   * attention". The product had four colours for this one concept: amber, brown, grey and a plain
   * outline. Rule: `technical_documentation/ui/STATUS_AND_BADGES.md` § 2.
   */
  archived: { label: "Archived", className: "border-brown-200 bg-brown-50 text-brown-600" },
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

/**
 * A person's status, mapped onto the shared vocabulary.
 *
 * This existed **three times, byte for byte**, in `PeopleTable`, `AssignedUsersTableContent` and
 * `AssignedUsersPanel` — differing only in a local variable name. All three imported
 * `models/user/status`, whose own comment says "use it everywhere instead of hardcoding", and then
 * each re-implemented the badge around it.
 *
 * **`Pending` and `Archived` used to render identically** — both fell through to a grey `secondary`
 * with no colour — which is worse than either choice on its own, since they mean opposite things.
 * `Pending` is gone: somebody who has not started yet is `PROSPECTIVE`, labelled *Not Started*, and
 * drawn as the neutral state rather than the archived one (LIFECYCLE_PROCESSES_DESIGN § 2.2).
 */
export const UserStatusBadge: React.FC<{ status?: string | null }> = ({ status }) => {
  if (!status) return null;

  return (
    <StatusBadge
      status={isActiveStatus(status) ? "active" : isProspectiveStatus(status) ? "draft" : "archived"}
      label={formatUserStatus(status)}
    />
  );
};

/**
 * The access axis, as a chip — and only when it says something.
 *
 * <p>A person carries two statuses, and the directory used to show one. *Not started* meant three
 * different things at once: somebody who starts on Monday, somebody invited who has not accepted,
 * and somebody who is a name in a table and nothing more. This is the second axis, drawn beside the
 * first, and it is silent for the ordinary case — an active account needs no chip, because every
 * account on the screen is one.
 *
 * <p>Blocked is included: it is an account state a reader needs to see wherever people are listed,
 * and it is the same word the profile header already uses.
 */
export const AccountStatusBadge: React.FC<{ accountStatus?: string | null }> = ({ accountStatus }) => {
  const code = (accountStatus ?? "").toUpperCase();
  if (code !== "DRAFT" && code !== "INVITED" && code !== "BLOCKED") return null;

  return <StatusBadge status={code === "DRAFT" ? "draft" : "inactive"} label={formatAccountStatus(code)} />;
};
