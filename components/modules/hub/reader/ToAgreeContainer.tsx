"use client";

import * as React from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Button } from "@/components/desact/button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { dateToISO, isoToDate } from "@/lib/date";
import type { AgreementRow } from "@/models/hub";
import { useMyAgreements } from "../hooks";
import { BackLink, HubLoadError, HubPage, HubSegmented, HubState, HubTitle, hubIcon, IconTile, LoadingBlock, SkeletonRows, useHubDates } from "../shared";

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
    // Padding 20 0, a hairline under every row, 18 from the tile to the text (FIXES D4).
    <li className="relative flex items-center gap-4.5 border-b border-divider py-5">
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
          {/* "By 27 Nov" 14/20 secondary in a fixed 96 column, 18 before Read (FIXES D5). */}
          {row.overdue ? (
            <span className="flex shrink-0 items-center gap-2">
              <StatusBadge status="declined" label={t("toAgree.overdue")} />
              <span className="text-body text-secondary">{t("toAgree.was", { date: dates.short(row.dueOn) })}</span>
            </span>
          ) : (
            <span className="w-24 shrink-0 text-body text-secondary">{row.dueOn ? t("toAgree.by", { date: dates.short(row.dueOn) }) : null}</span>
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
      <h2 className="flex items-baseline gap-2.5">
        <span className="text-card-title text-primary">{title}</span>
        <span className="text-hint text-tertiary">{t("handbook.pages", { count: rows.length })}</span>
      </h2>
      <ul className="mt-2 flex flex-col">
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
  // Counts only once they are known: never "· 0" over a wait or an error (FIXES U2).
  const loaded = Boolean(agreements.data);

  return (
    <HubPage width="column">
      <BackLink href="/hub" label={t("home.title")} />
      {/* The switch sits on the title block's bottom line, 16 from it (FIXES D1). */}
      <div className="mt-3 flex items-end gap-4">
        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <HubTitle>{t("toAgree.title")}</HubTitle>
          <p className="text-body text-secondary">{t("toAgree.lead")}</p>
        </div>
        <HubSegmented
          aria-label={t("toAgree.title")}
          value={tab}
          onChange={setTab}
          options={[
            { value: "WAITING", label: loaded ? t("toAgree.waitingTab", { count: waiting.length }) : t("toAgree.waiting") },
            { value: "AGREED", label: loaded ? t("toAgree.agreedTab", { count: agreed.length }) : t("toAgree.agreed") },
          ]}
        />
      </div>
      <div className="mt-10 flex flex-1 flex-col gap-10">
        {agreements.isLoading ? (
          <LoadingBlock skeleton={<SkeletonRows count={5} height="h-20" />} />
        ) : agreements.isError ? (
          <HubLoadError error={agreements.error} title={t("toAgree.error")} onRetry={() => void agreements.refetch()} />
        ) : tab === "WAITING" ? (
          waiting.length === 0 ? (
            // Centred in the free area under the title row (FIXES D6).
            <HubState scene="all-caught-up" size="m" titleSize="section" title={t("toAgree.emptyTitle")} line={t("toAgree.emptyLine")} />
          ) : (
            <>
              <Group title={t("toAgree.thisWeek")} rows={groups.thisWeek} />
              <Group title={t("toAgree.later")} rows={groups.later} />
            </>
          )
        ) : agreed.length === 0 ? (
          <HubState scene="all-caught-up" size="m" titleSize="section" title={t("toAgree.agreedEmpty")} />
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
