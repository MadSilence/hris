"use client";

import { FC, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Delete02Icon, Notification01Icon, Settings01Icon, StarIcon, TickDouble02Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/desact/icon";

import { Button } from "@/components/desact/button";
import { cn } from "@/lib/cn";
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
import { SearchBox } from "@/components/ui/SearchBox";
import {
  INBOX_FILTERS,
  INBOX_FILTER_LABELS,
  matchesInboxFilter,
  needsAction,
  parseInboxFilter,
  type InboxFilter,
} from "@/components/modules/notifications/utils/inboxFilters";

const ALL_CATEGORIES = "__all__";

const NotificationRow: FC<{
  notification: Notification;
  onOpen: (n: Notification) => void;
  onToggleStar: (n: Notification) => void;
  onDelete: (n: Notification) => void;
  busy: boolean;
}> = ({ notification, onOpen, onToggleStar, onDelete, busy }) => {
  const { title, message, icon, href } = presentNotification(notification);
  const clickable = href !== null || !notification.read;

  return (
    <div
      className={cn(
        "group flex gap-3 rounded-card border border-divider p-4 transition-colors",
        !notification.read && "bg-subtle/60",
        clickable && "cursor-pointer hover:border-field",
      )}
      onClick={() => onOpen(notification)}
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-control bg-card">
        <Icon icon={icon} className="text-secondary" />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          {/* The titles are written in sentence case where they are built; `capitalize` here title-cased every
              word on top of that and produced "Holidays Changed At The Source". */}
          <p className="truncate font-medium text-primary">{title}</p>
          {!notification.read && <span className="h-2 w-2 shrink-0 rounded-pill bg-accent" />}
        </div>
        {message && <p className="mt-0.5 text-body text-tertiary">{message}</p>}
        <div className="mt-1 flex items-center gap-2">
          <p className="text-hint text-tertiary">{timeAgo(notification.createdAt)}</p>
          {notification.category && (
            <span className="rounded-pill bg-mist px-2 py-0.5 text-hint font-medium text-secondary">
              {categoryLabel(notification.category)}
            </span>
          )}
        </div>
        <NotificationActions notification={notification} />
      </div>

      <div className="flex shrink-0 items-start gap-1" onClick={(e) => e.stopPropagation()}>
        <Button type="button"
          variant="ghost"
          size="icon-sm"
          aria-label={notification.starred ? "Unstar" : "Star"}
          disabled={busy}
          onClick={() => onToggleStar(notification)}
        >
          <Icon icon={StarIcon} className={cn("h-4 w-4", notification.starred ? "fill-status-pending-icon text-status-pending-icon" : "text-tertiary")} />
        </Button>
        <Button type="button"
          variant="ghost"
          size="icon-sm" className="text-tertiary hover:text-danger-text"
          aria-label="Delete"
          disabled={busy}
          onClick={() => onDelete(notification)}
        >
          <Icon icon={Delete02Icon} size="sm" />
        </Button>
      </div>
    </div>
  );
};

export const NotificationsInbox: FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { data: notifications, isLoading } = useNotifications();

  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();
  const markAllSeen = useMarkAllNotificationsSeen();
  const setStarred = useSetNotificationStarred();
  const remove = useDeleteNotification();

  /* The status filter lives in the URL (`?filter=needs-action`), so a link can open the inbox on it — home's
     *Waiting on You* and the board's "Review" do (sitting 2, H5). */
  const status: InboxFilter = parseInboxFilter(searchParams?.get("filter"));
  const setStatus = (next: InboxFilter) => {
    const params = new URLSearchParams(searchParams?.toString() ?? "");
    if (next === "all") params.delete("filter");
    else params.set("filter", next);
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  };
  const [category, setCategory] = useState<string>(ALL_CATEGORIES);
  const [query, setQuery] = useState("");

  const all = useMemo(() => notifications ?? [], [notifications]);

  /* The badge counts what has not been seen, and being on this page is seeing it: clear it when the inbox
     opens and again whenever a refetch brings something new while it is open. Items stay unread until
     opened. */
  const hasUnseen = all.some((n) => !n.seen);
  useEffect(() => {
    if (isLoading) return;
    if (hasUnseen || notifications === undefined) markAllSeen.mutate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasUnseen, isLoading]);

  const counts = useMemo(
    () => ({
      all: all.length,
      unread: all.filter((n) => !n.read).length,
      starred: all.filter((n) => n.starred).length,
      "needs-action": all.filter(needsAction).length,
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
    let rows = all.filter((n) => matchesInboxFilter(n, status));
    if (category !== ALL_CATEGORIES) rows = rows.filter((n) => n.category === category);

    /* Searched on what the reader can actually see — the presented title and message, not the raw
       record — so a hit always corresponds to text on the screen. */
    const needle = query.trim().toLowerCase();
    if (needle) {
      rows = rows.filter((n) => {
        const { title, message } = presentNotification(n);
        return (
          title.toLowerCase().includes(needle) ||
          (message ?? "").toLowerCase().includes(needle) ||
          categoryLabel(n.category).toLowerCase().includes(needle)
        );
      });
    }
    return rows;
  }, [all, status, category, query]);

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
    query.trim()
      ? "No notifications match your search."
      : status === "unread"
      ? "No unread notifications."
      : status === "starred"
        ? "No starred notifications."
      : status === "needs-action"
        ? "Nothing needs your action."
        : category !== ALL_CATEGORIES
          ? "Nothing in this category."
          : "No notifications yet.";

  return (
    <div className="mx-auto flex h-[calc(100svh-6rem)] w-full max-w-5xl flex-col gap-4 overflow-hidden">
      <div className="shrink-0 space-y-4">
      <section className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-page-title text-primary">Inbox</h1>
          {/* Nothing is known before the first answer, so the line says nothing rather than "caught up". */}
          {isLoading ? (
            <div aria-hidden className="mt-2 h-4 w-28 shimmer rounded-tag bg-mist" />
          ) : (
            <p className="mt-1 text-body text-tertiary">
              {counts.unread > 0 ? `${counts.unread} unread` : "You're all caught up"}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button type="button"
            variant="secondary"
            size="sm"
            onClick={() => markAllRead.mutate()}
            disabled={markAllRead.isPending || counts.unread === 0}
          >
            <Icon icon={TickDouble02Icon} size="sm" />
            Mark all as read
          </Button>
          <Button variant="ghost" size="icon-sm" aria-label="Notification preferences" asChild>
            <Link href="/preferences">
              <Icon icon={Settings01Icon} size="sm" className="text-tertiary" />
            </Link>
          </Button>
        </div>
      </section>

      <div className="flex flex-col gap-3">
        <SearchBox value={query} onChange={setQuery}/>

        <div className="flex gap-1">
          {INBOX_FILTERS.map((f) => (
            <button
              key={f}
              type="button"
              aria-pressed={status === f}
              onClick={() => setStatus(f)}
              className={cn(
                "flex items-center gap-1.5 rounded-control px-3 py-1.5 text-body transition-colors",
                status === f ? "bg-accent-muted font-medium text-accent-text" : "text-tertiary hover:bg-subtle hover:text-primary",
              )}
            >
              {INBOX_FILTER_LABELS[f]}
              <span
                className={cn(
                  "rounded-pill px-1.5 text-hint",
                  status === f ? "bg-accent text-on-accent" : "bg-mist text-tertiary",
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
                  "rounded-pill border px-3 py-1 text-hint font-medium transition-colors",
                  category === c
                    ? "border-inverse bg-inverse text-on-inverse"
                    : "border-divider text-tertiary hover:bg-subtle",
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
            <div key={i} className="h-20 shimmer rounded-control border border-divider bg-subtle" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex h-full flex-col items-center justify-center gap-3 rounded-card border border-dashed border-divider px-4 py-16 text-center">
          <Icon icon={Notification01Icon} size="lg" className="text-disabled" />
          <p className="text-body text-tertiary">{emptyText}</p>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {groups.map(({ group, items }) => (
            <div key={group.key} className="flex flex-col gap-2">
              <p className="px-1 text-hint font-semibold text-tertiary">
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
