"use client";

import { FC, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Bell, CheckCheck, Settings, Star, Trash2 } from "lucide-react";

import { Button } from "@/public/desact/src/components/ui/button";
import { cn } from "@/public/desact/src/components/ui/utils";
import type { Notification } from "@/models/notifications";
import { useNotifications } from "@/components/modules/notifications/hooks/useNotifications";
import {
  useDeleteNotification,
  useMarkAllNotificationsRead,
  useMarkAllNotificationsSeen,
  useMarkNotificationRead,
  useSetNotificationStarred,
} from "@/components/modules/notifications/hooks/useNotificationMutations";
import {
  categoryLabel,
  dateGroup,
  presentNotification,
  timeAgo,
  type DateGroup,
} from "@/components/modules/notifications/components/notificationPresenter";
import { NotificationActions } from "@/components/modules/notifications/components/NotificationActions";

type StatusFilter = "all" | "unread" | "starred";
const ALL_CATEGORIES = "__all__";

const STATUS_FILTERS: StatusFilter[] = ["all", "unread", "starred"];

const NotificationRow: FC<{
  notification: Notification;
  onOpen: (n: Notification) => void;
  onToggleStar: (n: Notification) => void;
  onDelete: (n: Notification) => void;
  busy: boolean;
}> = ({ notification, onOpen, onToggleStar, onDelete, busy }) => {
  const { title, message, Icon, href } = presentNotification(notification);
  const clickable = href !== null || !notification.read;

  return (
    <div
      className={cn(
        "group flex gap-3 rounded-lg border border-brown-200 p-4 transition-colors",
        !notification.read && "bg-brown-50/60",
        clickable && "cursor-pointer hover:border-brown-300",
      )}
      onClick={() => onOpen(notification)}
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white">
        <Icon className="h-5 w-5 text-brown-600" />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate font-medium capitalize text-brown-900">{title}</p>
          {!notification.read && <span className="h-2 w-2 shrink-0 rounded-full bg-brown-600" />}
        </div>
        {message && <p className="mt-0.5 text-sm text-muted-foreground">{message}</p>}
        <div className="mt-1 flex items-center gap-2">
          <p className="text-xs text-muted-foreground">{timeAgo(notification.createdAt)}</p>
          {notification.category && (
            <span className="rounded-full bg-brown-100 px-2 py-0.5 text-[11px] font-medium text-brown-600">
              {categoryLabel(notification.category)}
            </span>
          )}
        </div>
        <NotificationActions notification={notification} />
      </div>

      <div className="flex shrink-0 items-start gap-1" onClick={(e) => e.stopPropagation()}>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          aria-label={notification.starred ? "Unstar" : "Star"}
          disabled={busy}
          onClick={() => onToggleStar(notification)}
        >
          <Star className={cn("h-4 w-4", notification.starred ? "fill-amber-400 text-amber-400" : "text-brown-400")} />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-brown-400 hover:text-destructive"
          aria-label="Delete"
          disabled={busy}
          onClick={() => onDelete(notification)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export const NotificationsInbox: FC = () => {
  const router = useRouter();
  const { data: notifications, isLoading } = useNotifications();

  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();
  const markAllSeen = useMarkAllNotificationsSeen();
  const setStarred = useSetNotificationStarred();
  const remove = useDeleteNotification();

  const [status, setStatus] = useState<StatusFilter>("all");
  const [category, setCategory] = useState<string>(ALL_CATEGORIES);

  // Clear the badge (seen) as soon as the inbox is opened; items stay unread until opened.
  useEffect(() => {
    markAllSeen.mutate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const all = useMemo(() => notifications ?? [], [notifications]);

  const counts = useMemo(
    () => ({
      all: all.length,
      unread: all.filter((n) => !n.read).length,
      starred: all.filter((n) => n.starred).length,
    }),
    [all],
  );

  // Categories actually present in the data — no empty placeholder chips.
  const categories = useMemo(() => {
    const seen = new Set<string>();
    for (const n of all) if (n.category) seen.add(n.category);
    return [...seen].sort();
  }, [all]);

  const filtered = useMemo(() => {
    let rows = all;
    if (status === "unread") rows = rows.filter((n) => !n.read);
    else if (status === "starred") rows = rows.filter((n) => n.starred);
    if (category !== ALL_CATEGORIES) rows = rows.filter((n) => n.category === category);
    return rows;
  }, [all, status, category]);

  // Group the visible rows into date sections, preserving the (newest-first) server order within each.
  const groups = useMemo(() => {
    const map = new Map<string, { group: DateGroup; items: Notification[] }>();
    for (const n of filtered) {
      const g = dateGroup(n.createdAt);
      const bucket = map.get(g.key) ?? { group: g, items: [] };
      bucket.items.push(n);
      map.set(g.key, bucket);
    }
    return [...map.values()].sort((a, b) => a.group.order - b.group.order);
  }, [filtered]);

  const handleOpen = (n: Notification) => {
    if (!n.read) {
      markRead.mutate(n.id);
    }
    const { href } = presentNotification(n);
    if (href) {
      router.push(href);
    }
  };

  const busy = setStarred.isPending || remove.isPending;

  const emptyText =
    status === "unread"
      ? "No unread notifications."
      : status === "starred"
        ? "No starred notifications."
        : category !== ALL_CATEGORIES
          ? "Nothing in this category."
          : "No notifications yet.";

  return (
    <div className="mx-auto flex h-[calc(100svh-6rem)] w-full max-w-5xl flex-col gap-4 overflow-hidden">
      <div className="shrink-0 space-y-4">
      <section className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-brown-900">Inbox</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {counts.unread > 0 ? `${counts.unread} unread` : "You're all caught up"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => markAllRead.mutate()}
            disabled={markAllRead.isPending || counts.unread === 0}
          >
            <CheckCheck className="h-4 w-4" />
            Mark all as read
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Notification preferences" asChild>
            <Link href="/inbox/preferences">
              <Settings className="h-4 w-4 text-brown-500" />
            </Link>
          </Button>
        </div>
      </section>

      <div className="flex flex-col gap-3">
        <div className="flex gap-1">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setStatus(f)}
              className={cn(
                "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm capitalize transition-colors",
                status === f ? "bg-brown-100 text-brown-800" : "text-muted-foreground hover:bg-brown-50",
              )}
            >
              {f}
              <span
                className={cn(
                  "rounded-full px-1.5 text-xs",
                  status === f ? "bg-brown-200 text-brown-700" : "bg-brown-100 text-brown-500",
                )}
              >
                {counts[f]}
              </span>
            </button>
          ))}
        </div>

        {categories.length > 1 && (
          <div className="flex flex-wrap gap-1.5">
            {[ALL_CATEGORIES, ...categories].map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCategory(c)}
                className={cn(
                  "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                  category === c
                    ? "border-brown-300 bg-brown-100 text-brown-800"
                    : "border-brown-200 text-muted-foreground hover:bg-brown-50",
                )}
              >
                {c === ALL_CATEGORIES ? "All categories" : categoryLabel(c)}
              </button>
            ))}
          </div>
        )}
      </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto pb-2">
      {isLoading ? (
        <div className="flex flex-col gap-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-lg border border-brown-200 bg-brown-50" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-brown-200 px-4 py-16 text-center">
          <Bell className="h-8 w-8 text-brown-300" />
          <p className="text-sm text-muted-foreground">{emptyText}</p>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {groups.map(({ group, items }) => (
            <div key={group.key} className="flex flex-col gap-2">
              <p className="px-1 text-xs font-semibold uppercase tracking-wide text-brown-400">
                {group.label}
              </p>
              {items.map((n) => (
                <NotificationRow
                  key={n.id}
                  notification={n}
                  busy={busy}
                  onOpen={handleOpen}
                  onToggleStar={(x) => setStarred.mutate({ id: x.id, starred: !x.starred })}
                  onDelete={(x) => remove.mutate(x.id)}
                />
              ))}
            </div>
          ))}
        </div>
      )}
      </div>
    </div>
  );
};

export default NotificationsInbox;
