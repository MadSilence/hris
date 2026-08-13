import type { ComponentType } from "react";
import { Bell, CalendarClock, CheckCircle2, XCircle } from "lucide-react";
import type { Notification } from "@/models/notifications";

export type NotificationPresentation = {
  title: string;
  message: string;
  Icon: ComponentType<{ className?: string }>;
  href: string | null;
};

const str = (v: unknown): string => (v == null ? "" : String(v));

const dayCount = (amount: string): string => {
  const n = Number(amount);
  if (!Number.isFinite(n)) return amount;
  const label = Number.isInteger(n) ? String(n) : n.toFixed(1);
  return `${label} ${n === 1 ? "day" : "days"}`;
};

/**
 * Turns a stored notification (type + params) into display text + a deep-link, rendered at read time
 * (templates, not snapshot strings). Deep-links are built here from target/params via a shared
 * resolver; a type with no destination yet returns href=null (renders as a non-navigating item).
 */
export const presentNotification = (n: Notification): NotificationPresentation => {
  const p = n.params ?? {};

  switch (n.type) {
    case "TIMEOFF_APPROVAL_REQUESTED": {
      const requesterId = str(p.requesterId);
      return {
        title: "Time off approval requested",
        message: `${str(p.requesterName) || "An employee"} requested ${dayCount(str(p.amount))} · ${str(p.startDate)} → ${str(p.endDate)}`,
        Icon: CalendarClock,
        href: requesterId ? `/organization/people/${requesterId}/time-off` : null,
      };
    }
    case "TIMEOFF_REQUEST_APPROVED":
      return {
        title: "Time off approved",
        message: `Your request ${str(p.startDate)} → ${str(p.endDate)} was approved.`,
        Icon: CheckCircle2,
        href: null,
      };
    case "TIMEOFF_REQUEST_REJECTED":
      return {
        title: "Time off rejected",
        message: `Your request ${str(p.startDate)} → ${str(p.endDate)} was rejected.`,
        Icon: XCircle,
        href: null,
      };
    default:
      return {
        title: n.type.replaceAll("_", " ").toLowerCase(),
        message: "",
        Icon: Bell,
        href: n.targetType && n.targetId ? null : null,
      };
  }
};

const CATEGORY_LABELS: Record<string, string> = {
  APPROVALS: "Approvals",
  ORG_CHANGES: "Org changes",
  REMINDERS: "Reminders",
  POLICIES: "Policies",
  SYSTEM: "System",
};

/** Friendly label for a notification category (falls back to a humanized key for unknown ones). */
export const categoryLabel = (category: string): string =>
  CATEGORY_LABELS[category] ?? category.replaceAll("_", " ").toLowerCase();

export type DateGroup = { key: string; label: string; order: number };

/**
 * Buckets a notification's timestamp into a coarse date section for grouped rendering
 * (Today / Yesterday / This week / Earlier). `order` gives a stable sort, newest bucket first.
 */
export const dateGroup = (iso: string): DateGroup => {
  const then = new Date(iso);
  if (Number.isNaN(then.getTime())) return { key: "earlier", label: "Earlier", order: 3 };

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const dayMs = 24 * 60 * 60 * 1000;
  const diffDays = Math.floor((startOfToday.getTime() - then.getTime()) / dayMs);

  if (then.getTime() >= startOfToday.getTime()) return { key: "today", label: "Today", order: 0 };
  if (diffDays < 1) return { key: "yesterday", label: "Yesterday", order: 1 };
  if (diffDays < 7) return { key: "week", label: "This week", order: 2 };
  return { key: "earlier", label: "Earlier", order: 3 };
};

export const timeAgo = (iso: string): string => {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";
  const secs = Math.max(0, Math.floor((Date.now() - then) / 1000));
  if (secs < 60) return "just now";
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
};
