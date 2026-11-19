"use client";

import React from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { File01Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/desact/icon";
import { Button } from "@/components/desact/button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useCurrentUser } from "@/components/providers/CurrentUserProvider/CurrentUserProvider";
import { useWaitingOnMe } from "@/components/modules/notifications/hooks/useWaitingOnMe";
import { dateToISO, useShortDates } from "@/lib/date";
import { cn } from "@/lib/cn";
import {
  BigNumber,
  TWO_LINE_ROW,
  WidgetCard,
  WidgetEmpty,
  WidgetError,
  WidgetLink,
  WidgetScroll,
  WidgetSkeleton,
} from "@/components/modules/home/components/WidgetCard";
import type { HomeWidgetProps } from "./catalogue";
import { signHref, toSignOf, type ToSignRow } from "./toSign";

/**
 * To sign (`home-widgets` § 7, LW07; built with the designers' Home fixes, Q-7): the documents waiting for the reader's
 * signature, soonest due first. Sign opens the signing screen — a document is read before it is signed, never on Home.
 * Overdue turns the due line into the Declined status "Overdue". Only pending documents: a signed one leaves.
 */
export const ToSignWidget: React.FC<HomeWidgetProps> = ({ size, preview }) => {
  const t = useTranslations("home");
  const dates = useShortDates();
  const { userId } = useCurrentUser();
  const waiting = useWaitingOnMe();
  const rows = toSignOf(waiting.data);
  const title = t("widgets.toSign.title");
  const today = dateToISO(new Date());
  const all = userId ? `/organization/people/${userId}/documents` : "/organization/people";
  const link = <WidgetLink href={all}>{t("toSign.all")}</WidgetLink>;
  const tab = preview ? -1 : undefined;

  if (waiting.isLoading) {
    return (
      <WidgetCard title={title} size={size} aside={link}>
        <WidgetSkeleton number rows={size === "S" ? 0 : 3} />
      </WidgetCard>
    );
  }
  if (waiting.error) {
    return (
      <WidgetCard title={title} size={size} aside={link}>
        <WidgetError size={size} message={t("toSign.couldNotLoad")} onRetry={() => void waiting.refetch()} />
      </WidgetCard>
    );
  }
  if (rows.length === 0) {
    return (
      <WidgetCard title={title} size={size} aside={link}>
        <WidgetEmpty size={size} scene="documents" title={t("toSign.emptyTitle")} line={t("toSign.emptyLine")} />
      </WidgetCard>
    );
  }

  // "Due Fri, 20 Nov" (S1); 12/18 under the name in Medium, 13/20 beside Sign in Large (S4).
  const due = (row: ToSignRow, large: boolean) =>
    row.dueOn && row.dueOn < today ? (
      <StatusBadge status="declined" size="sm" label={t("toSign.overdue")} />
    ) : row.dueOn ? (
      <span className={large ? "truncate text-label leading-5 font-normal text-tertiary" : TWO_LINE_ROW.line}>
        {t("toSign.due", { date: dates.date(row.dueOn, { weekday: true, hideYear: true }) })}
      </span>
    ) : null;

  if (size === "S") {
    const next = rows[0];
    return (
      <WidgetCard title={title} size={size} aside={link}>
        <BigNumber size="s" value={rows.length} word={t("toSign.pending")} />
        {next.dueOn && (
          <p className="truncate text-label leading-5 font-normal text-secondary">
            {t("toSign.nextDue", { date: dates.date(next.dueOn, { weekday: true, hideYear: true }) })}
          </p>
        )}
      </WidgetCard>
    );
  }

  return (
    <WidgetCard title={title} size={size} aside={link}>
      {/* S2: 40/40 in Medium and in Large (LW07's Large frame; it was 44/40 there, walk of 2026-11-19). */}
      <BigNumber size="m" value={rows.length} word={t("toSign.pending")} className="[&>span:first-child]:leading-10" />
      <WidgetScroll>
        {/* S3: a hairline above every row, the first one too; rows as A4. */}
        <ul className="flex flex-col">
          {rows.map((row) => (
            <li key={row.envelopeId} className={cn("flex items-center border-t border-divider py-[9px]", size === "L" ? "gap-3" : "gap-2.5")}>
              {size === "L" && (
                <span aria-hidden className="flex size-8 shrink-0 items-center justify-center rounded-control bg-accent-subtle text-accent-text">
                  <Icon icon={File01Icon} size="sm" />
                </span>
              )}
              <Link href={signHref(row.envelopeId)} tabIndex={tab} className="flex min-w-0 flex-1 flex-col hover:underline underline-offset-4">
                <span className={TWO_LINE_ROW.name}>{row.title}</span>
                {size !== "L" && due(row, false)}
                {/* S4: who sent it, by name — never "HR". */}
                {size === "L" && row.from && <span className={TWO_LINE_ROW.line}>{t("toSign.from", { name: row.from })}</span>}
              </Link>
              {size === "L" && <span className="shrink-0">{due(row, true)}</span>}
              <Button asChild variant="secondary" size="sm" tabIndex={tab}>
                <Link href={signHref(row.envelopeId)}>{t("toSign.sign")}</Link>
              </Button>
            </li>
          ))}
        </ul>
      </WidgetScroll>
    </WidgetCard>
  );
};
