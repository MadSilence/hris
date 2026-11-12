"use client";

import * as React from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Download04Icon, SentIcon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/desact/button";
import { Checkbox } from "@/components/desact/checkbox";
import { Icon } from "@/components/desact/icon";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/desact/popover";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/desact/tooltip";
import { EmptyState, NoResults } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { FilterChip } from "@/components/ui/FilterChip";
import { SearchBox } from "@/components/ui/SearchBox";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { SelectionBar } from "@/components/ui/SelectionBar";
import type { AgreedPerson, AgreementTab } from "@/models/hub";
import { cn } from "@/lib/cn";
import { useWhoAgreed } from "../hooks";
import { HubPage, HubTitle, LoadingBlock, PersonAvatar, ProgressBar, SkeletonRows, TruncatedTitle, useHubDates } from "../shared";
import { useRemind } from "./remind";

const PAGE_SIZE = 50;
const DAY_MS = 24 * 60 * 60 * 1000;

/** Reminded in the last 24 h: Remind is disabled for them, "Reminded today" (CM08). */
export const remindedRecently = (person: Pick<AgreedPerson, "remindedAt">, now: number = Date.now()): boolean =>
  Boolean(person.remindedAt) && now - new Date(person.remindedAt as string).getTime() < DAY_MS;

type Filters = { department: string | null; office: string | null; q: string };

export const filterPeople = (rows: AgreedPerson[], filters: Filters): AgreedPerson[] => {
  const q = filters.q.trim().toLocaleLowerCase();
  return rows.filter(
    (r) =>
      (!filters.department || r.department === filters.department) &&
      (!filters.office || r.office === filters.office) &&
      (!q || r.name.toLocaleLowerCase().includes(q)),
  );
};

/** A filter chip that opens the values the list holds. */
const ValueFilter: React.FC<{ label: string; values: string[]; value: string | null; onChange: (v: string | null) => void }> = ({
  label,
  values,
  value,
  onChange,
}) => {
  const [open, setOpen] = React.useState(false);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <FilterChip withArrow selected={value !== null}>
          {value ?? label}
        </FilterChip>
      </PopoverTrigger>
      <PopoverContent align="start" className="flex max-h-72 w-60 flex-col overflow-y-auto p-1">
        {[null, ...values].map((v) => (
          <button
            key={v ?? "__all"}
            type="button"
            onClick={() => {
              onChange(v);
              setOpen(false);
            }}
            className={cn("rounded-control px-2 py-1.5 text-left text-body hover:bg-subtle", v === value && "bg-subtle font-medium")}
          >
            {v ?? label}
          </button>
        ))}
      </PopoverContent>
    </Popover>
  );
};

/**
 * CM08, Who agreed: one must-read page person by person — the numbers, Not yet / Agreed, the filters, the table with
 * selection, Remind (held back for 5 s behind an Undo) and the CSV of the current tab.
 */
export const WhoAgreedContainer: React.FC<{ id: string }> = ({ id }) => {
  const t = useTranslations("hub");
  const dates = useHubDates();
  const remind = useRemind();
  const [tab, setTab] = React.useState<AgreementTab>("NOT_YET");
  const [filters, setFilters] = React.useState<Filters>({ department: null, office: null, q: "" });
  const [selected, setSelected] = React.useState<Set<string>>(new Set());
  const [pageIndex, setPageIndex] = React.useState(0);
  const query = useWhoAgreed(id, tab);
  const data = query.data;

  React.useEffect(() => {
    setSelected(new Set());
    setPageIndex(0);
  }, [tab, filters]);

  const rows = filterPeople(data?.rows ?? [], filters);
  const shown = rows.slice(pageIndex * PAGE_SIZE, (pageIndex + 1) * PAGE_SIZE);
  const remindable = shown.filter((r) => !remindedRecently(r));
  const departments = Array.from(new Set((data?.rows ?? []).map((r) => r.department).filter((v): v is string => Boolean(v)))).sort();
  const offices = Array.from(new Set((data?.rows ?? []).map((r) => r.office).filter((v): v is string => Boolean(v)))).sort();
  const notYetTab = tab === "NOT_YET";

  const toggle = (userId: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(userId)) next.delete(userId);
      else next.add(userId);
      return next;
    });

  return (
    <HubPage>
      <nav aria-label={t("page.breadcrumb")} className="flex flex-wrap items-center gap-1.5 text-label">
        <Link href="/hub/manage" className="text-secondary no-underline hover:text-primary">
          {t("manage.title")}
        </Link>
        <span className="text-tertiary">/</span>
        <Link href="/hub/manage/pages" className="text-secondary no-underline hover:text-primary">
          {t("manage.tabs.pages")}
        </Link>
        {data && (
          <>
            <span className="text-tertiary">/</span>
            <span className="text-primary">{data.title}</span>
          </>
        )}
      </nav>
      <div className="mt-3 flex flex-wrap items-start gap-4">
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <HubTitle>{t("agreed.title")}</HubTitle>
          {data && (
            <p className="text-body text-secondary">
              {data.dueOn
                ? t("agreed.subtitle", { page: data.title, version: data.versionNo, date: dates.short(data.dueOn) })
                : t("agreed.subtitleNoDue", { page: data.title, version: data.versionNo })}
            </p>
          )}
        </div>
        <Button asChild variant="secondary">
          <Link href={`/hub/manage/pages/${id}/edit`} className="no-underline">
            {t("page.edit")}
          </Link>
        </Button>
        {data && data.remindable > 0 && (
          <Button type="button" className="gap-1.5" onClick={() => remind(id, [], data.remindable, () => void query.refetch())}>
            <Icon icon={SentIcon} size="sm" />
            {t("agreed.remindPeople", { count: data.remindable })}
          </Button>
        )}
      </div>

      {query.isLoading ? (
        <LoadingBlock className="mt-10" skeleton={<SkeletonRows count={8} height="h-11" />} />
      ) : query.isError || !data ? (
        <div className="mt-10">
          <ErrorState error={query.error} onRetry={() => void query.refetch()} />
        </div>
      ) : (
        <>
          <div className="mt-10 flex flex-wrap items-end gap-16">
            <div className="flex flex-col gap-2">
              <p className="flex items-baseline gap-2">
                <span className="text-hub-hero text-primary tabular-nums">{data.agreed}</span>
                <span className="text-body text-secondary">{t("agreed.ofNeeded", { needed: data.needed })}</span>
              </p>
              <ProgressBar value={data.agreed} max={data.needed} className="w-[360px]" />
            </div>
            <p className="flex items-baseline gap-2">
              <span className="text-hub-celebration text-primary tabular-nums">{data.notYet}</span>
              <span className="text-body text-secondary">
                {data.versionNo > 1 ? t("agreed.notYetPrevious", { count: data.agreedPrevious, version: data.versionNo - 1 }) : t("agreed.notYet")}
              </span>
            </p>
            {data.newHires > 0 && (
              <p className="flex items-baseline gap-2">
                <span className="text-hub-celebration text-primary tabular-nums">{data.newHires}</span>
                <span className="text-body text-secondary">{t("agreed.newHires")}</span>
              </p>
            )}
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <SegmentedControl<AgreementTab>
              fill={false}
              aria-label={t("agreed.title")}
              value={tab}
              onChange={setTab}
              options={[
                { value: "NOT_YET", label: t("agreed.tabNotYet", { count: data.notYet }) },
                { value: "AGREED", label: t("agreed.tabAgreed", { count: data.agreed }) },
              ]}
            />
            <span aria-hidden className="h-6 w-px bg-divider" />
            <ValueFilter label={t("agreed.department")} values={departments} value={filters.department} onChange={(department) => setFilters((f) => ({ ...f, department }))} />
            <ValueFilter label={t("agreed.office")} values={offices} value={filters.office} onChange={(office) => setFilters((f) => ({ ...f, office }))} />
            <span className="ml-auto flex items-center gap-2">
              <SearchBox className="w-60" value={filters.q} onChange={(q) => setFilters((f) => ({ ...f, q }))} aria-label={t("agreed.search")} />
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button asChild variant="ghost" size="icon">
                    <a href={`/api/hub/manage/pages/${id}/agreements/export?tab=${tab}`} download aria-label={t("agreed.export")}>
                      <Icon icon={Download04Icon} size="sm" />
                    </a>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{t("agreed.export")}</TooltipContent>
              </Tooltip>
            </span>
          </div>

          {selected.size > 0 && (
            <div className="mt-4">
              <SelectionBar
                count={selected.size}
                onClear={() => setSelected(new Set())}
                actions={[
                  {
                    key: "remind",
                    label: t("agreed.remindPeople", { count: selected.size }),
                    icon: SentIcon,
                    onClick: () => {
                      const ids = Array.from(selected);
                      setSelected(new Set());
                      remind(id, ids, ids.length, () => void query.refetch());
                    },
                  },
                ]}
              />
            </div>
          )}

          <div className="mt-4">
            {(data.rows ?? []).length === 0 ? (
              notYetTab ? (
                <EmptyState scene="all-approved" title={t("agreed.everyoneAgreed")} description="" />
              ) : (
                <EmptyState compact scene="all-caught-up" title={t("toAgree.agreedEmpty")} description="" />
              )
            ) : rows.length === 0 ? (
              <NoResults
                title={t("manage.nothingMatches", { text: filters.q.trim() })}
                hint=""
                onClearSearch={() => setFilters({ department: null, office: null, q: "" })}
              />
            ) : (
              <table className="w-full text-body">
                <thead>
                  <tr className="h-9 border-b border-divider text-left text-hint text-tertiary">
                    {notYetTab && (
                      <th className="w-10 font-normal">
                        <Checkbox
                          aria-label={t("agreed.selectAll")}
                          checked={remindable.length > 0 && remindable.every((r) => selected.has(r.userId))}
                          disabled={remindable.length === 0}
                          onCheckedChange={(v) => setSelected(v === true ? new Set(remindable.map((r) => r.userId)) : new Set())}
                        />
                      </th>
                    )}
                    <th className="font-normal">{t("agreed.columns.name")}</th>
                    <th className="font-normal">{t("agreed.columns.department")}</th>
                    <th className="font-normal">{t("agreed.columns.office")}</th>
                    {notYetTab ? (
                      <>
                        <th className="font-normal">{t("agreed.columns.lastAgreed")}</th>
                        <th className="font-normal">{t("agreed.columns.reminded")}</th>
                      </>
                    ) : (
                      <th className="font-normal">{t("agreed.columns.agreed")}</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {shown.map((row) => {
                    const recent = remindedRecently(row);
                    return (
                      <tr key={row.userId} className="h-11 border-b border-divider hover:bg-row-hover">
                        {notYetTab && (
                          <td>
                            {recent ? (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span>
                                    <Checkbox aria-label={row.name} disabled checked={false} />
                                  </span>
                                </TooltipTrigger>
                                <TooltipContent>{t("agreed.remindedToday")}</TooltipContent>
                              </Tooltip>
                            ) : (
                              <Checkbox aria-label={row.name} checked={selected.has(row.userId)} onCheckedChange={() => toggle(row.userId)} />
                            )}
                          </td>
                        )}
                        <td className="max-w-64">
                          <Link href={`/organization/people/${row.userId}/personal`} className="flex min-w-0 items-center gap-2 text-primary no-underline hover:underline">
                            <PersonAvatar person={{ name: row.name, avatarUrl: row.avatarUrl }} />
                            <TruncatedTitle title={row.name} />
                          </Link>
                        </td>
                        <td className="text-secondary">{row.department ?? "—"}</td>
                        <td className="text-secondary">{row.office ?? "—"}</td>
                        {notYetTab ? (
                          <>
                            <td className="text-secondary tabular-nums">
                              {row.lastAgreed ? t("agreed.lastAgreed", { version: row.lastAgreed.versionNo, date: dates.short(row.lastAgreed.at) }) : "—"}
                            </td>
                            <td className="text-secondary tabular-nums">{row.remindedAt ? dates.short(row.remindedAt) : "—"}</td>
                          </>
                        ) : (
                          <td className="text-secondary tabular-nums">{row.agreedAt ? `${dates.long(row.agreedAt)}, ${dates.time(row.agreedAt)}` : "—"}</td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
            {rows.length > PAGE_SIZE && (
              <div className="mt-4 flex items-center justify-end gap-3 text-label text-secondary">
                <span className="tabular-nums">
                  {t("agreed.range", { from: pageIndex * PAGE_SIZE + 1, to: Math.min(rows.length, (pageIndex + 1) * PAGE_SIZE), total: rows.length })}
                </span>
                <Button type="button" variant="secondary" size="sm" disabled={pageIndex === 0} onClick={() => setPageIndex((p) => p - 1)}>
                  {t("agreed.previous")}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  disabled={(pageIndex + 1) * PAGE_SIZE >= rows.length}
                  onClick={() => setPageIndex((p) => p + 1)}
                >
                  {t("agreed.next")}
                </Button>
              </div>
            )}
          </div>
        </>
      )}
    </HubPage>
  );
};
