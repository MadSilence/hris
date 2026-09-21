"use client";

import * as React from "react";
import { ChevronRight, ScrollText } from "lucide-react";
import UserChip from "@/components/modules/settings/shared/UserChip/UserChip";
import { ChangesDiff } from "@/components/modules/settings/modules/logs/components/ChangesDiff/ChangesDiff";
import { ListEmptyState } from "@/components/feedback/ListEmptyState";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/public/desact/src/components/ui/table";
import { Skeleton } from "@/public/desact/src/components/ui/skeleton";
import { Badge } from "@/public/desact/src/components/ui/badge";
import type { ActivityLogEntry } from "@/models/activityLog";

const COLUMNS = 6;

/**
 * The company's journal, read-only.
 *
 * <p><b>The row opens in place.</b> The diff, the actor's role at the time, the address and the
 * reference are all *about* the row, and a side panel would be the same content behind more state.
 *
 * <p><b>People are chips, and a deleted one is still a chip.</b> The names are snapshotted on the row
 * when it is written, precisely because the trail outlives the people in it; a row whose actor has
 * since been deleted keeps the name and loses the link.
 */
export const LogsTable: React.FC<{
  items: ActivityLogEntry[];
  isLoading: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  query: string;
}> = ({ items, isLoading, isLoadingMore, hasMore, onLoadMore, query }) => {
  const [expanded, setExpanded] = React.useState<Set<string>>(new Set());
  const scroller = React.useRef<HTMLDivElement | null>(null);
  const sentinel = React.useRef<HTMLDivElement | null>(null);

  /*
   * A sentinel below the last row, watched **against the scroll container** — the same shape the
   * People table uses.
   *
   * The `root` is the point. Watching against the viewport, which is the default, means the next page
   * arrives only when the sentinel scrolls into the *window*; inside a table with its own scrollbar
   * that can be never, and the list silently stops at fifty rows with no way to ask for more.
   */
  React.useEffect(() => {
    const root = scroller.current;
    const target = sentinel.current;
    if (!root || !target || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && !isLoadingMore) onLoadMore();
      },
      { root, rootMargin: "300px" },
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, [hasMore, isLoadingMore, onLoadMore, items.length]);

  const toggle = (id: string) =>
    setExpanded((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    /*
     * The shared `Table` used to be the scrollport its own sticky header stuck to; this list worked
     * around it with `[&>div]:overflow-x-visible`. `stickyHeader` is that fix, in the shared piece.
     */
    <div ref={scroller} className="min-h-0 flex-1 overflow-auto">
      <Table stickyHeader>
        <TableHeader className="sticky top-0 z-10 bg-background">
          <TableRow>
            <TableHead className="w-[9rem]">When</TableHead>
            <TableHead className="w-[14rem]">Who</TableHead>
            <TableHead>What</TableHead>
            <TableHead className="w-[16rem]">On what</TableHead>
            <TableHead className="w-[14rem]">About whom</TableHead>
            <TableHead className="w-10"/>
          </TableRow>
        </TableHeader>

        <TableBody>
          {isLoading &&
            Array.from({ length: 8 }).map((_, index) => (
              <TableRow key={`skeleton-${index}`} className="hover:bg-transparent">
                {Array.from({ length: COLUMNS }).map((__, cell) => (
                  <TableCell key={cell}>
                    <Skeleton className="h-4 w-full"/>
                  </TableCell>
                ))}
              </TableRow>
            ))}

          {!isLoading &&
            items.map((row) => {
              const open = expanded.has(row.id);
              return (
                <React.Fragment key={row.id}>
                  <TableRow
                    className="cursor-pointer align-top"
                    onClick={() => toggle(row.id)}
                    aria-expanded={open}
                  >
                    <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                      {formatWhen(row.createdAt)}
                    </TableCell>

                    <TableCell>
                      <Actor row={row}/>
                    </TableCell>

                    <TableCell>
                      <span className="text-sm text-foreground">{row.actionLabel}</span>
                      {row.module && (
                        <Badge variant="secondary" className="ml-2 font-normal">
                          {humanise(row.module)}
                        </Badge>
                      )}
                    </TableCell>

                    <TableCell className="text-sm">
                      {row.objectName ? (
                        <span className="text-foreground">{row.objectName}</span>
                      ) : (
                        <span className="text-muted-foreground">{humanise(row.objectType)}</span>
                      )}
                    </TableCell>

                    <TableCell>
                      {row.targetUserId || row.targetUserName ? (
                        <UserChip id={row.targetUserId} name={row.targetUserName ?? "Deleted person"}/>
                      ) : (
                        <span className="text-sm text-muted-foreground">—</span>
                      )}
                    </TableCell>

                    <TableCell>
                      <ChevronRight
                        className={`h-4 w-4 text-muted-foreground transition-transform ${open ? "rotate-90" : ""}`}
                        aria-hidden
                      />
                    </TableCell>
                  </TableRow>

                  {open && (
                    <TableRow className="hover:bg-transparent">
                      <TableCell colSpan={COLUMNS} className="bg-muted/30">
                        <RowDetail row={row}/>
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              );
            })}

          {!isLoading && items.length === 0 && (
            <TableRow className="hover:bg-transparent">
              <TableCell colSpan={COLUMNS}>
                {/* Nothing to create from a journal: it is written by the rest of the product. */}
                <ListEmptyState
                  query={query}
                  icon={<ScrollText className="h-7 w-7"/>}
                  title="Nothing recorded yet"
                  description="Everything people do in this company shows up here."
                  noResultsHint="Try a different name, period or module."
                />
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* `data-has-more` is not decoration: it is how the live walk told "the observer never fired"
          apart from "there was nothing left to fetch". */}
      <div ref={sentinel} data-has-more={hasMore}/>
      {isLoadingMore && (
        <div className="py-3 text-center text-sm text-muted-foreground">Loading…</div>
      )}
    </div>
  );
};

const Actor: React.FC<{ row: ActivityLogEntry }> = ({ row }) => {
  if (row.actorType === "SYSTEM" && !row.actorName) {
    return <span className="text-sm text-muted-foreground">{row.source ?? "System"}</span>;
  }

  return (
    <div className="min-w-0">
      <UserChip id={row.actorUserId} name={row.actorName ?? "Deleted person"}/>
      {/* Decided by a person, applied by a process — the same shape impersonation uses. */}
      {row.source && (
        <div className="pl-8 text-xs text-muted-foreground">applied by {row.source}</div>
      )}
      {row.impersonatedBy && (
        <div className="pl-8 text-xs text-warning-700">while acting as somebody else</div>
      )}
    </div>
  );
};

const RowDetail: React.FC<{ row: ActivityLogEntry }> = ({ row }) => {
  const metadata = (row.metadata ?? {}) as Record<string, unknown>;
  const changes = metadata.changes as Record<string, unknown> | undefined;
  const rest = Object.fromEntries(
    Object.entries(metadata).filter(([key]) => key !== "changes" && key !== "traceId"),
  );

  return (
    <div className="space-y-4 py-2">
      {changes && Object.keys(changes).length > 0 && <ChangesDiff changes={changes}/>}

      <dl className="grid grid-cols-2 gap-x-8 gap-y-1 text-xs text-muted-foreground md:grid-cols-4">
        <Fact label="Action" value={row.action}/>
        <Fact label="Actor role" value={row.actorRole}/>
        <Fact label="Actor type" value={row.actorType}/>
        <Fact label="Object type" value={row.objectType}/>
        <Fact label="IP address" value={row.ipAddress}/>
        <Fact label="Reference" value={row.traceId}/>
        <Fact label="Object id" value={row.objectId}/>
        <Fact label="Device" value={row.userAgent}/>
      </dl>

      {Object.keys(rest).length > 0 && (
        <details className="text-xs">
          <summary className="cursor-pointer text-muted-foreground">Everything else the row carries</summary>
          <pre className="mt-2 overflow-auto rounded bg-background p-3 text-[11px] leading-relaxed">
            {JSON.stringify(rest, null, 2)}
          </pre>
        </details>
      )}
    </div>
  );
};

const Fact: React.FC<{ label: string; value: string | null }> = ({ label, value }) =>
  value ? (
    <div className="min-w-0">
      <dt className="text-[11px] uppercase tracking-wide text-muted-foreground/70">{label}</dt>
      <dd className="truncate text-foreground" title={value}>
        {value}
      </dd>
    </div>
  ) : null;

const humanise = (code: string | null): string => {
  if (!code) return "—";
  const spaced = code.replace(/_/g, " ").toLowerCase();
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
};

/** The company's own clock is the backend's job; this only has to be readable and stable. */
const formatWhen = (iso: string): string => {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleString(undefined, {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
};
