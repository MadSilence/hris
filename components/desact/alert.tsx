import * as React from "react";
import {
  Alert02Icon,
  CheckmarkCircle02Icon,
  InformationCircleIcon,
  HourglassIcon,
} from "@hugeicons/core-free-icons";

import { Icon, type IconSvgElement } from "@/components/desact/icon";
import { cn } from "@/lib/cn";

/*
 * The two message surfaces of SPEC § 13.7 that are not a dialog or a toast.
 *
 *   InlineAlert   inside a form or a dialog: the status's soft background, its icon, a sentence. Four tones —
 *                 approved (done), pending (worth knowing before you go on), declined (refused), info.
 *   Banner        the state of a whole page: neutral Mist, a gray icon, Ink text. Never yellow or red (§ 4.6,
 *                 § 12) — a page is not an error, and red belongs to the field that failed.
 *
 * `role` follows the tone: a refusal is an alert, everything else a status, so a screen reader announces each
 * the way it deserves. `action` is a trailing button or link, right-aligned.
 */
export type AlertTone = "approved" | "pending" | "declined" | "info";

const TONES: Record<AlertTone, { icon: IconSvgElement; box: string; iconClass: string }> = {
  approved: {
    icon: CheckmarkCircle02Icon,
    box: "border-status-approved-border bg-status-approved-bg text-status-approved-text",
    iconClass: "text-status-approved-icon",
  },
  pending: {
    icon: HourglassIcon,
    box: "border-status-pending-border bg-status-pending-bg text-status-pending-text",
    iconClass: "text-status-pending-icon",
  },
  declined: {
    icon: Alert02Icon,
    box: "border-status-declined-border bg-status-declined-bg text-status-declined-text",
    iconClass: "text-status-declined-icon",
  },
  info: {
    icon: InformationCircleIcon,
    box: "border-status-info-border bg-status-info-bg text-status-info-text",
    iconClass: "text-status-info-icon",
  },
};

type AlertProps = {
  tone?: AlertTone;
  /** A bold first line, when the sentence needs one. */
  title?: React.ReactNode;
  children?: React.ReactNode;
  action?: React.ReactNode;
  icon?: IconSvgElement;
  className?: string;
};

function InlineAlert({ tone = "info", title, children, action, icon, className }: AlertProps) {
  const style = TONES[tone];
  return (
    <div
      role={tone === "declined" ? "alert" : "status"}
      className={cn("flex items-start gap-2.5 rounded-control border px-3 py-2.5 text-body", style.box, className)}
    >
      <Icon icon={icon ?? style.icon} size="sm" className={cn("mt-0.5 shrink-0", style.iconClass)} />
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        {title && <p className="font-medium">{title}</p>}
        {children && <div>{children}</div>}
      </div>
      {action && <div className="shrink-0 self-center">{action}</div>}
    </div>
  );
}

function Banner({ title, children, action, icon, className }: Omit<AlertProps, "tone">) {
  return (
    <div role="status" className={cn("flex items-start gap-2.5 rounded-popover bg-mist px-4 py-3 text-body text-primary", className)}>
      <Icon icon={icon ?? InformationCircleIcon} size="sm" className="mt-0.5 shrink-0 text-secondary" />
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        {title && <p className="font-medium">{title}</p>}
        {children && <div className="text-secondary">{children}</div>}
      </div>
      {action && <div className="shrink-0 self-center">{action}</div>}
    </div>
  );
}

export { InlineAlert, Banner };
