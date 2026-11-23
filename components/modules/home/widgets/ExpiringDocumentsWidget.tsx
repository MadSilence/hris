"use client";

import React from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/cn";
import { useShortDates } from "@/lib/date";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { NO_SECTION_FILTERS, useSectionExpiring } from "@/components/modules/signing/hooks/useDocumentsSection";
import {
  BigNumber,
  CounterPill,
  PersonFace,
  WidgetCard,
  WidgetEmpty,
  WidgetError,
  WidgetLink,
  WidgetScroll,
  WidgetSkeleton,
} from "@/components/modules/home/components/WidgetCard";
import type { HomeWidgetProps } from "./catalogue";

/** The full list: the Documents section's Expiring view (documents-section D02). */
const FULL_LIST = "/documents?view=expiring";

/**
 * Expiring documents (documents-expiry X10, after `home-widgets`): the next few to run out within the reader's scope,
 * soonest first, and how many have already expired — in Pending amber for soon, Declined for past. Nothing expiring
 * is a good state, said so.
 */
export const ExpiringDocumentsWidget: React.FC<HomeWidgetProps> = ({ size, preview }) => {
  const t = useTranslations("home");
  const dates = useShortDates();
  const query = useSectionExpiring(NO_SECTION_FILTERS, true);
  const rows = [...(query.data ?? [])].sort((a, b) =>
    (a.document.expiresOn ?? "").localeCompare(b.document.expiresOn ?? ""),
  );
  const expired = rows.filter((r) => r.document.expiryState === "EXPIRED").length;
  const title = t("widgets.expiringDocuments.title");

  if (query.isLoading) {
    return (
      <WidgetCard title={title} size={size}>
        <WidgetSkeleton number={size === "S"} rows={size === "S" ? 0 : 3} />
      </WidgetCard>
    );
  }
  if (query.error) {
    return (
      <WidgetCard title={title} size={size}>
        <WidgetError size={size} message={t("expiringDocuments.couldNotLoad")} onRetry={() => void query.refetch()} />
      </WidgetCard>
    );
  }
  if (rows.length === 0) {
    return (
      <WidgetCard title={title} size={size}>
        <WidgetEmpty size={size} scene="documents" title={t("expiringDocuments.emptyTitle")} line={t("expiringDocuments.emptyLine")} />
      </WidgetCard>
    );
  }

  if (size === "S") {
    return (
      <WidgetCard title={title} size={size} aside={<WidgetLink href={FULL_LIST}>{t("expiringDocuments.all")}</WidgetLink>}>
        <BigNumber size="s" value={rows.length} word={t("expiringDocuments.toRenew")} />
        {expired > 0 && <StatusBadge status="declined" size="sm" label={t("expiringDocuments.expired", { count: expired })} />}
      </WidgetCard>
    );
  }

  const shown = size === "M" ? rows.slice(0, 5) : rows;
  return (
    <WidgetCard
      title={title}
      size={size}
      titleExtra={<CounterPill count={rows.length} />}
      aside={<WidgetLink href={FULL_LIST}>{t("expiringDocuments.all")}</WidgetLink>}
    >
      <WidgetScroll>
        <ul className="flex flex-col divide-y divide-divider">
          {shown.map((r) => {
            const past = r.document.expiryState === "EXPIRED";
            return (
              <li key={r.document.id}>
                <Link
                  href={`/organization/people/${r.personId}/documents`}
                  tabIndex={preview ? -1 : undefined}
                  className="-mx-2 flex items-center gap-3 rounded-control px-2 py-2.5 hover:bg-subtle"
                >
                  <PersonFace name={r.personName} size={28} />
                  <span className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate text-body font-medium text-primary">{r.document.name}</span>
                    <span className="truncate text-hint text-tertiary">{r.personName}</span>
                  </span>
                  <span className={cn("shrink-0 text-hint tabular-nums", past ? "text-status-declined-text" : "text-status-pending-text")}>
                    {r.document.expiresOn
                      ? past
                        ? t("expiringDocuments.expiredOn", { date: dates.date(r.document.expiresOn) })
                        : t("expiringDocuments.expiresOn", { date: dates.date(r.document.expiresOn) })
                      : null}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </WidgetScroll>
      {expired > 0 && (
        <div className="flex flex-wrap gap-2">
          <StatusBadge status="declined" size="sm" label={t("expiringDocuments.expired", { count: expired })} />
        </div>
      )}
    </WidgetCard>
  );
};
