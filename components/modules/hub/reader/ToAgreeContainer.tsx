"use client";

import * as React from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Button } from "@/components/desact/button";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { dateToISO, isoToDate } from "@/lib/date";
import type { AgreementRow } from "@/models/hub";
import { useMyAgreements } from "../hooks";
import { BackLink, HubPage, HubTitle, hubIcon, IconTile, LoadingBlock, SkeletonRows, useHubDates } from "../shared";

/**
 * CH03's two groups: **This week** — due in the next 7 days, or already overdue — and **Later**. An empty group
 * is not drawn.
 */
export const groupWaiting = (rows: AgreementRow[], today: Date): { thisWeek: AgreementRow[]; later: AgreementRow[] } => {
  const limit = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 7);
  const thisWeek: AgreementRow[] = [];
  const later: AgreementRow[] = [];
  for (const row of rows) {
    const due = row.dueOn ? isoToDate(row.dueOn) : null;
    if (row.overdue || (due !== null && due <= limit)) thisWeek.push(row);
    else later.push(row);
  }
  const byDue = (a: AgreementRow, b: AgreementRow) => (a.dueOn ?? "9999").localeCompare(b.dueOn ?? "9999");
  return { thisWeek: thisWeek.sort(byDue), later: later.sort(byDue) };
};

const AgreementRowView: React.FC<{ row: AgreementRow; agreed?: boolean }> = ({ row, agreed = false }) => {
  const t = useTranslations("hub");
  const dates = useHubDates();
  const what =
    row.what === "CHANGED"
      ? t("toAgree.changed", { count: row.changesCount })
      : row.what === "OVERDUE" && row.agreedVersion !== null
        ? t("toAgree.agreedIn", { version: row.agreedVersion, month: dates.month(row.previousAgreedAt) })
        : t("toAgree.new");
  return (
    <li className="relative flex min-h-[84px] items-center gap-4 border-b border-divider py-3 last:border-b-0">
      <IconTile icon={hubIcon(row.icon)} color={row.color} size={44} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Link href={`/hub/handbook/${row.pageId}`} className="line-clamp-2 text-card-title text-primary no-underline after:absolute after:inset-0 hover:underline">
          {row.title}
        </Link>
        <span className="truncate text-hint text-tertiary">
          {agreed
            ? t("toAgree.metaAgreed", { section: row.sectionName ?? "", version: row.versionNo })
            : t("toAgree.meta", { section: row.sectionName ?? "", version: row.versionNo, what })}
        </span>
      </div>
      {agreed ? (
        <span className="shrink-0 text-label text-tertiary">{t("toAgree.agreedOn", { date: dates.short(row.agreedAt) })}</span>
      ) : (
        <>
          {row.overdue ? (
            <span className="flex shrink-0 items-center gap-2">
              <StatusBadge status="declined" label={t("toAgree.overdue")} />
              <span className="text-label text-tertiary">{t("toAgree.was", { date: dates.short(row.dueOn) })}</span>
            </span>
          ) : (
            row.dueOn && <span className="shrink-0 text-label text-tertiary">{t("toAgree.by", { date: dates.short(row.dueOn) })}</span>
          )}
          <Button asChild variant="secondary" size="sm" className="relative z-10">
            <Link href={`/hub/handbook/${row.pageId}`} className="no-underline">
              {t("toAgree.read")}
            </Link>
          </Button>
        </>
      )}
    </li>
  );
};

const Group: React.FC<{ title: string; rows: AgreementRow[] }> = ({ title, rows }) => {
  const t = useTranslations("hub");
  const [all, setAll] = React.useState(false);
  if (rows.length === 0) return null;
  const shown = all ? rows : rows.slice(0, 5);
  return (
    <section className="flex flex-col">
      <h2 className="flex items-baseline gap-2">
        <span className="text-card-title text-primary">{title}</span>
        <span className="text-hint text-tertiary">{t("handbook.pages", { count: rows.length })}</span>
      </h2>
      <ul className="flex flex-col">
        {shown.map((row) => (
          <AgreementRowView key={row.pageId} row={row} />
        ))}
      </ul>
      {!all && rows.length > 5 && (
        <Button type="button" variant="link" className="mt-2 w-fit" onClick={() => setAll(true)}>
          {t("toAgree.showMore", { count: rows.length - 5 })}
        </Button>
      )}
    </section>
  );
};

/** CH03, Pages need your yes: Waiting by due date, or Agreed, newest first. */
export const ToAgreeContainer: React.FC = () => {
  const t = useTranslations("hub");
  const [tab, setTab] = React.useState<"WAITING" | "AGREED">("WAITING");
  const agreements = useMyAgreements();
  const waiting = agreements.data?.waiting ?? [];
  const agreed = [...(agreements.data?.agreed ?? [])].sort((a, b) => (b.agreedAt ?? "").localeCompare(a.agreedAt ?? ""));
  const groups = groupWaiting(waiting, isoToDate(dateToISO(new Date())));

  return (
    <HubPage width="column">
      <BackLink href="/hub" label={t("home.title")} />
      <div className="mt-3 flex items-start gap-6">
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <HubTitle>{t("toAgree.title")}</HubTitle>
          <p className="text-body text-secondary">{t("toAgree.lead")}</p>
        </div>
        <SegmentedControl
          fill={false}
          aria-label={t("toAgree.title")}
          value={tab}
          onChange={setTab}
          options={[
            { value: "WAITING", label: t("toAgree.waitingTab", { count: waiting.length }) },
            { value: "AGREED", label: t("toAgree.agreedTab", { count: agreed.length }) },
          ]}
        />
      </div>
      <div className="mt-8 flex flex-col gap-8">
        {agreements.isLoading ? (
          <LoadingBlock skeleton={<SkeletonRows count={5} height="h-20" />} />
        ) : agreements.isError ? (
          <ErrorState error={agreements.error} onRetry={() => void agreements.refetch()} />
        ) : tab === "WAITING" ? (
          waiting.length === 0 ? (
            <EmptyState scene="all-caught-up" title={t("toAgree.emptyTitle")} description={t("toAgree.emptyLine")} />
          ) : (
            <>
              <Group title={t("toAgree.thisWeek")} rows={groups.thisWeek} />
              <Group title={t("toAgree.later")} rows={groups.later} />
            </>
          )
        ) : agreed.length === 0 ? (
          <EmptyState scene="all-caught-up" title={t("toAgree.agreedEmpty")} description="" />
        ) : (
          <ul className="flex flex-col">
            {agreed.map((row) => (
              <AgreementRowView key={row.pageId} row={row} agreed />
            ))}
          </ul>
        )}
      </div>
    </HubPage>
  );
};
