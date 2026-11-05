"use client";

import * as React from "react";
import {
  Archive02Icon,
  Calendar03Icon,
  CancelCircleIcon,
  CheckmarkCircle02Icon,
  HelpCircleIcon,
  HourglassIcon,
  Loading03Icon,
  PencilEdit02Icon,
  Remove01Icon,
} from "@hugeicons/core-free-icons";

import { useTranslations } from "next-intl";

import { Icon, type IconSvgElement } from "@/components/desact/icon";
import { cn } from "@/lib/cn";
import { formatAccountStatus, formatUserStatus, isActiveStatus, isProspectiveStatus } from "@/models/user/status";

/**
 * The one status chip (SPEC § 4.5, § 13.4): a 24 px pill, a 14 px icon and a 12/16 semibold word on the
 * status's soft background. **A status is always an icon and a word**; the colour is the third signal, never
 * the only one. Status colours are never themed: Approved is Pine and an error is red in every workspace.
 *
 * Nine statuses, and nothing else may wear their colours:
 *
 *   approved      approved, signed, completed, submitted, paid — and an active person or record
 *   pending       waiting on a decision or on information
 *   in-progress   started, in review
 *   scheduled     starts later
 *   declined      declined, overdue, expired, failed
 *   info          information
 *   draft         not started; drawn white with a dashed border
 *   inactive      inactive
 *   archived      kept for history, cancelled
 *
 * There is no "Needs your nod" status: what waits for a person's decision is shown by the Approve button, and
 * the request itself is Pending.
 *
 * An entity maps its own enum onto these and writes nothing else. The four words of the old shared
 * vocabulary (`active`, `inactive`, `draft`, `archived`) are still accepted; `active` is drawn as approved.
 * Rule: `technical_documentation/ui/STATUS_AND_BADGES.md`.
 */
export type StatusTone =
  | "approved"
  | "pending"
  | "in-progress"
  | "scheduled"
  | "declined"
  | "info"
  | "draft"
  | "inactive"
  | "archived";

export type EntityStatus = "active" | "inactive" | "draft" | "archived";

type StatusLabelKey = `status.${"approved" | "pending" | "inProgress" | "scheduled" | "declined" | "info" | "draft" | "inactive" | "archived" | "active"}`;

type StatusStyle = { labelKey: StatusLabelKey; icon: IconSvgElement; className: string; iconClassName: string };

/* Written out in full so Tailwind finds every class in the source. */
const STYLES: Record<StatusTone, StatusStyle> = {
  approved: {
    labelKey: "status.approved",
    icon: CheckmarkCircle02Icon,
    className: "bg-status-approved-bg text-status-approved-text",
    iconClassName: "text-status-approved-icon",
  },
  pending: {
    labelKey: "status.pending",
    icon: HourglassIcon,
    className: "bg-status-pending-bg text-status-pending-text",
    iconClassName: "text-status-pending-icon",
  },
  "in-progress": {
    labelKey: "status.inProgress",
    icon: Loading03Icon,
    className: "bg-status-in-progress-bg text-status-in-progress-text",
    iconClassName: "text-status-in-progress-icon",
  },
  scheduled: {
    labelKey: "status.scheduled",
    icon: Calendar03Icon,
    className: "bg-status-scheduled-bg text-status-scheduled-text",
    iconClassName: "text-status-scheduled-icon",
  },
  declined: {
    labelKey: "status.declined",
    icon: CancelCircleIcon,
    className: "bg-status-declined-bg text-status-declined-text",
    iconClassName: "text-status-declined-icon",
  },
  info: {
    labelKey: "status.info",
    icon: HelpCircleIcon,
    className: "bg-status-info-bg text-status-info-text",
    iconClassName: "text-status-info-icon",
  },
  draft: {
    labelKey: "status.draft",
    icon: PencilEdit02Icon,
    className: "border border-dashed border-status-draft-border bg-status-draft-bg text-status-draft-text",
    iconClassName: "text-status-draft-icon",
  },
  inactive: {
    labelKey: "status.inactive",
    icon: Remove01Icon,
    className: "bg-status-inactive-bg text-status-inactive-text",
    iconClassName: "text-status-inactive-icon",
  },
  archived: {
    labelKey: "status.archived",
    icon: Archive02Icon,
    className: "bg-status-archived-bg text-status-archived-text",
    iconClassName: "text-status-archived-icon",
  },
};

const ENTITY_TONES: Record<EntityStatus, { tone: StatusTone; labelKey: StatusLabelKey }> = {
  active: { tone: "approved", labelKey: "status.active" },
  inactive: { tone: "inactive", labelKey: "status.inactive" },
  draft: { tone: "draft", labelKey: "status.draft" },
  archived: { tone: "archived", labelKey: "status.archived" },
};

const resolve = (status: StatusTone | EntityStatus): { tone: StatusTone; labelKey: StatusLabelKey } =>
  status in ENTITY_TONES
    ? ENTITY_TONES[status as EntityStatus]
    : { tone: status as StatusTone, labelKey: STYLES[status as StatusTone].labelKey };

export const StatusBadge: React.FC<{
  status: StatusTone | EntityStatus;
  /** Overrides the word only. The colour and the icon stay tied to the status. */
  label?: string;
  /** `sm` (20 px) in dense tables; `md` (24 px) everywhere else. */
  size?: "sm" | "md";
  className?: string;
}> = ({ status, label, size = "md", className }) => {
  const t = useTranslations("common");
  const resolved = resolve(status);
  const style = STYLES[resolved.tone];

  return (
    <span
      data-slot="status-badge"
      data-status={resolved.tone}
      className={cn(
        "inline-flex w-fit shrink-0 items-center gap-1 rounded-pill text-hint font-semibold whitespace-nowrap",
        size === "sm" ? "h-5 px-1.5" : "h-6 px-2",
        style.className,
        className,
      )}
    >
      <Icon icon={style.icon} size="sm" className={cn("size-3.5", style.iconClassName)} />
      {label ?? t(resolved.labelKey)}
    </span>
  );
};

/**
 * A person's employment status (SPEC § 4.5 "Lifecycles"): somebody who has not started yet is Scheduled,
 * an active person is Approved, a person who has left is Inactive.
 */
export const UserStatusBadge: React.FC<{ status?: string | null; size?: "sm" | "md" }> = ({ status, size }) => {
  const tCommon = useTranslations("common");
  if (!status) return null;

  const tone: StatusTone = isActiveStatus(status) ? "approved" : isProspectiveStatus(status) ? "scheduled" : "inactive";
  return <StatusBadge status={tone} label={formatUserStatus(tCommon, status)} size={size} />;
};

/**
 * The access axis, as a chip — and only when it says something.
 *
 * <p>A person carries two statuses, and the directory used to show one. *Not started* meant three different
 * things at once: somebody who starts on Monday, somebody invited who has not accepted, and somebody who is a
 * name in a table and nothing more. This is the second axis, drawn beside the first, and it is silent for the
 * ordinary case — an active account needs no chip, because every account on the screen is one.
 *
 * <p>A draft is Draft; an invitation not yet accepted is Pending — it waits on the person; a blocked account
 * is Declined.
 */
export const AccountStatusBadge: React.FC<{ accountStatus?: string | null; size?: "sm" | "md" }> = ({ accountStatus, size }) => {
  const tCommon = useTranslations("common");
  const code = (accountStatus ?? "").toUpperCase();
  const tone: StatusTone | null =
    code === "DRAFT" ? "draft" : code === "INVITED" ? "pending" : code === "BLOCKED" ? "declined" : null;
  if (!tone) return null;

  return <StatusBadge status={tone} label={formatAccountStatus(tCommon, code)} size={size} />;
};
