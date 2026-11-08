"use client";

import { displayLocale, useDisplayLocale } from "@/lib/date";
import * as React from "react";
import { useTranslations } from "next-intl";
import { ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/desact/icon";
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
} from "@/components/desact/table";
import { Skeleton } from "@/components/desact/skeleton";
import { Badge } from "@/components/desact/badge";
import type { ActivityLogEntry } from "@/models/activityLog";
import { NodRing } from "@/components/desact/nod";

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
  const t = useTranslations("settings.logs.table");
  const locale = useDisplayLocale();
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
        <TableHeader className="sticky top-0 z-10 bg-page">
          <TableRow>
            <TableHead className="w-[9rem]">{t("when")}</TableHead>
            <TableHead className="w-[14rem]">{t("who")}</TableHead>
            <TableHead>{t("what")}</TableHead>
            <TableHead className="w-[16rem]">{t("onWhat")}</TableHead>
            <TableHead className="w-[14rem]">{t("aboutWhom")}</TableHead>
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
                    <TableCell className="whitespace-nowrap text-body text-tertiary">
                      {formatWhen(row.createdAt, locale)}
                    </TableCell>

                    <TableCell>
                      <Actor row={row}/>
                    </TableCell>

                    <TableCell>
                      <span className="text-body text-primary">{row.actionLabel}</span>
                      {row.module && (
                        <Badge variant="neutral" className="ml-2 font-normal">
                          {humanise(row.module)}
                        </Badge>
                      )}
                    </TableCell>

                    <TableCell className="text-body">
                      {row.objectName ? (
                        <span className="text-primary">{row.objectName}</span>
                      ) : (
                        <span className="text-tertiary">{humanise(row.objectType)}</span>
                      )}
                    </TableCell>

                    <TableCell>
                      {row.targetUserId || row.targetUserName ? (
                        <UserChip id={row.targetUserId} name={row.targetUserName ?? t("deletedPerson")}/>
                      ) : (
                        <span className="text-body text-tertiary">—</span>
                      )}
                    </TableCell>

                    <TableCell>
                      <Icon
                        icon={ArrowRight01Icon}
                        size="sm"
                        className={`text-tertiary transition-transform duration-(--duration-menu) ${open ? "rotate-90" : ""}`}
                      />
                    </TableCell>
                  </TableRow>

                  {open && (
                    <TableRow className="hover:bg-transparent">
                      <TableCell colSpan={COLUMNS} className="bg-mist/30">
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
                  scene="history"
                  title={t("emptyTitle")}
                  description={t("emptyDescription")}
                  noResultsHint={t("noResultsHint")}
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
        <div className="flex justify-center py-3"><NodRing size="sm" /></div>
      )}
    </div>
  );
};

const Actor: React.FC<{ row: ActivityLogEntry }> = ({ row }) => {
  const t = useTranslations("settings.logs.table");
  if (row.actorType === "SYSTEM" && !row.actorName) {
    return <span className="text-body text-tertiary">{row.source ?? t("system")}</span>;
  }

  return (
    <div className="min-w-0">
      <UserChip id={row.actorUserId} name={row.actorName ?? t("deletedPerson")}/>
      {/* Decided by a person, applied by a process — the same shape impersonation uses. */}
      {row.source && (
        <div className="pl-8 text-hint text-tertiary">{t("appliedBy", { source: row.source })}</div>
      )}
      {row.impersonatedBy && (
        <div className="pl-8 text-hint text-status-pending-text">{t("impersonated")}</div>
      )}
    </div>
  );
};

const RowDetail: React.FC<{ row: ActivityLogEntry }> = ({ row }) => {
  const t = useTranslations("settings.logs.detail");
  const tCommon = useTranslations("common");
  const metadata = (row.metadata ?? {}) as Record<string, unknown>;
  const changes = metadata.changes as Record<string, unknown> | undefined;
  const rest = Object.fromEntries(
    Object.entries(metadata).filter(([key]) => key !== "changes" && key !== "traceId"),
  );

  return (
    <div className="space-y-4 py-2">
      {changes && Object.keys(changes).length > 0 && <ChangesDiff changes={changes}/>}

      <dl className="grid grid-cols-2 gap-x-8 gap-y-1 text-hint text-tertiary md:grid-cols-4">
        <Fact label={t("action")} value={row.action}/>
        <Fact label={t("actorRole")} value={row.actorRole}/>
        <Fact label={t("actorType")} value={row.actorType}/>
        <Fact label={t("objectType")} value={row.objectType}/>
        <Fact label={t("ipAddress")} value={row.ipAddress}/>
        <Fact label={t("reference")} value={row.traceId}/>
        <Fact label={t("objectId")} value={row.objectId}/>
        <Fact label={t("device")} value={row.userAgent}/>
      </dl>

      {row.mentions && row.mentions.length > 0 && (
        <dl className="grid grid-cols-1 gap-x-8 gap-y-1 text-hint sm:grid-cols-2">
          {row.mentions.map((m) => (
            <div key={m.key} className="min-w-0">
              <dt className="text-hint text-tertiary/70">{mentionLabel(m.key, t)}</dt>
              <dd className="truncate text-primary" title={m.id}>
                {m.name ?? tCommon("values.unknown")}
                {m.gone && <span className="text-tertiary"> · {t("deletedSince")}</span>}
              </dd>
            </div>
          ))}
        </dl>
      )}

      {Object.keys(rest).length > 0 && (
        <details className="text-hint">
          <summary className="cursor-pointer text-tertiary">{t("rest")}</summary>
          <pre className="mt-2 overflow-auto rounded-tag bg-page p-3 text-hint leading-relaxed">
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
      <dt className="text-hint text-tertiary/70">{label}</dt>
      <dd className="truncate text-primary" title={value}>
        {value}
      </dd>
    </div>
  ) : null;

/** What a mention's id key is, for a reader: `managerIdFrom` → "Manager (before)". */
const MENTION_LABELS = {
  policyId: "mentions.policyId",
  categoryId: "mentions.categoryId",
  folderId: "mentions.folderId",
  oldFolderId: "mentions.oldFolderId",
  newFolderId: "mentions.newFolderId",
  levelId: "mentions.levelId",
  familyId: "mentions.familyId",
  groupId: "mentions.groupId",
  calendarId: "mentions.calendarId",
  leadId: "mentions.leadId",
  managerIdFrom: "mentions.managerIdFrom",
  managerIdTo: "mentions.managerIdTo",
  newManagerId: "mentions.newManagerId",
  parentId: "mentions.parentId",
  oldParentId: "mentions.oldParentId",
  assignableId: "mentions.assignableId",
  // The grantee of a shared saved view, one key per kind (PeopleViewActivityEvent).
  granteeUserId: "mentions.granteeUserId",
  teamId: "mentions.teamId",
  departmentId: "mentions.departmentId",
  roleId: "mentions.roleId",
} as const;

type DetailTranslator = ReturnType<typeof useTranslations<"settings.logs.detail">>;

const mentionLabel = (key: string, t: DetailTranslator): string => {
  const labelKey: (typeof MENTION_LABELS)[keyof typeof MENTION_LABELS] | undefined =
    MENTION_LABELS[key as keyof typeof MENTION_LABELS];
  return labelKey ? t(labelKey) : humanise(key.replace(/Id/, ""));
};

const humanise = (code: string | null): string => {
  if (!code) return "—";
  const spaced = code.replace(/_/g, " ").toLowerCase();
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
};

/** The company's own clock is the backend's job; this only has to be readable and stable. */
const formatWhen = (iso: string, locale?: string): string => {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleString(locale ?? displayLocale(), {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
};
