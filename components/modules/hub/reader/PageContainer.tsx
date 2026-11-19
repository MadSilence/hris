"use client";

import * as React from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { PencilEdit02Icon } from "@hugeicons/core-free-icons";
import { Banner } from "@/components/desact/alert";
import { Button } from "@/components/desact/button";
import { Icon } from "@/components/desact/icon";
import { Skeleton } from "@/components/desact/skeleton";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/desact/tooltip";
import { TagChip } from "@/components/ui/TagChip";
import { useCanAccess } from "@/components/auth";
import type { HubPage as HubPageModel } from "@/models/hub";
import { agreeToPageAction } from "../actions";
import { HubDocumentView } from "../document";
import { unwrapHub, useHubPage, useInvalidateHub } from "../hooks";
import {
  firstNameOf,
  HubBreadcrumbs,
  HubPage,
  HubReadError,
  hubIcon,
  IconTile,
  LoadingBlock,
  PersonAvatar,
  SaveButton,
  useAudienceLabel,
  useHubDates,
} from "../shared";
import { AgreeBar } from "./AgreeBar";

/** Whether the reader sees What changed: they agreed to an older version, and the editor wrote points for this one. */
export const showsWhatChanged = (page: Pick<HubPageModel, "agreement" | "versionNo" | "whatChanged">): boolean =>
  page.agreement !== null && page.agreement.versionNo < page.versionNo && page.whatChanged.length > 0;

/** The bar is for a must-read page whose current version waits for this reader. */
export const showsAgreeBar = (page: Pick<HubPageModel, "mustRead" | "request" | "preview" | "revisionId">): boolean =>
  page.mustRead && page.request !== null && !page.preview && Boolean(page.revisionId);

/** What changed (`WhatChanged`, CP02): the title and up to five points, then "Show {n} more". */
export const WhatChanged: React.FC<{ points: string[]; agreedVersion: number }> = ({ points, agreedVersion }) => {
  const t = useTranslations("hub");
  const [all, setAll] = React.useState(false);
  const shown = all ? points : points.slice(0, 5);
  return (
    // 48 under the version line, padding 22 24, radius 16; the dot 8 accent, 7 down, 10 to the text (FIXES F7).
    <section className="mt-12 flex flex-col gap-3 rounded-card bg-accent-subtle px-6 py-5.5">
      <h2 className="text-card-title text-primary">{t("page.whatChanged", { count: points.length, version: agreedVersion })}</h2>
      <ul className="flex flex-col gap-2">
        {shown.map((point, i) => (
          <li key={i} className="flex items-start gap-2.5 text-body text-secondary">
            <span aria-hidden className="mt-[7px] size-2 shrink-0 rounded-pill bg-accent" />
            {point}
          </li>
        ))}
      </ul>
      {!all && points.length > 5 && (
        <Button type="button" variant="link" className="w-fit" onClick={() => setAll(true)}>
          {t("page.showMore", { count: points.length - 5 })}
        </Button>
      )}
    </section>
  );
};

/**
 * CP02, one page: the breadcrumb, the icon and title with the read time, the audience and save; the owner and
 * "Version {n} · updated {date}"; What changed for a reader who agreed to an older version; the body; and the agree
 * bar while the current version waits for them. `preview` is the editor's draft (CM06 Preview), under a banner.
 */
export const PageContainer: React.FC<{ id: string; preview?: boolean }> = ({ id, preview = false }) => {
  const t = useTranslations("hub");
  const dates = useHubDates();
  const audience = useAudienceLabel();
  const canEdit = useCanAccess("HUB.CONTENT", "EDIT");
  const invalidate = useInvalidateHub();
  const query = useHubPage(id, preview);
  const page = query.data;
  // What changed stays until the reader leaves the page, even after they agree.
  const [keepChanges, setKeepChanges] = React.useState<boolean | null>(null);
  const [agreedNow, setAgreedNow] = React.useState<string | null>(null);
  React.useEffect(() => {
    if (page && keepChanges === null) setKeepChanges(showsWhatChanged(page));
  }, [page, keepChanges]);

  const breadcrumb = (
    <HubBreadcrumbs
      label={t("page.breadcrumb")}
      items={[
        { href: "/hub", label: t("home.title") },
        { href: "/hub/handbook", label: t("handbook.title") },
        ...(page?.sectionName ? [{ href: `/hub/handbook#section-${page.sectionId}`, label: page.sectionName }] : []),
      ]}
    />
  );

  return (
    <HubPage>
      {preview && (
        <Banner className="mb-6" title={t("page.previewBanner")} />
      )}
      <div className="flex max-w-[720px] flex-1 flex-col">
        {breadcrumb}
        {query.isLoading ? (
          <LoadingBlock
            className="mt-10"
            skeleton={
              <div className="flex flex-col gap-4">
                <Skeleton className="h-11 w-3/4" />
                <Skeleton className="h-4 w-1/3" />
                {Array.from({ length: 6 }, (_, i) => (
                  <Skeleton key={i} className="h-4 w-full" />
                ))}
              </div>
            }
          />
        ) : query.isError || !page ? (
          <HubReadError error={query.error} back={{ href: "/hub/handbook", label: t("errors.goToHandbook") }} title={t("editor.loadError")} onRetry={() => void query.refetch()} />
        ) : (
          <article className="flex flex-1 flex-col">
            <div className="mt-10 flex items-start gap-4">
              <IconTile icon={hubIcon(page.icon)} color={page.color} size={52} />
              {/*
                The title takes every free pixel; the read time sits after it on its first line, outside the h1 (F1). It
                never shrinks below its own width — the right group gives way instead, its audience chip cutting with "…"
                ("Code of conduct" broke onto two lines beside an owner's Edit page, walk of 2026-11-19; any shrink at all,
                even a fraction of a pixel, wraps the h1). A title too long for the row wraps inside what the right group
                needs at least: the chip's start, Edit page and Save.
              */}
              <div className="flex max-w-[calc(100%-260px)] min-w-0 flex-[1_0_auto] items-baseline gap-4">
                <h1 className="min-w-0 text-hub-doc-title text-primary">{page.title}</h1>
                <span className="shrink-0 text-hint whitespace-nowrap text-tertiary">
                  {t("page.readTime", { count: Math.max(1, page.readMinutes) })}
                </span>
              </div>
              <span className="mt-2 flex min-w-0 shrink-[100] items-center gap-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="flex max-w-[200px] min-w-0">
                      <TagChip color="ocean">{audience(page.audienceLabel)}</TagChip>
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>{audience(page.audienceLabel)}</TooltipContent>
                </Tooltip>
                {canEdit && !preview && (
                  <Button asChild variant="secondary" size="sm" className="gap-1.5">
                    <Link href={`/hub/manage/pages/${page.id}/edit`} className="no-underline">
                      <Icon icon={PencilEdit02Icon} size="sm" />
                      {t("page.edit")}
                    </Link>
                  </Button>
                )}
                {!preview && <SaveButton type="PAGE" id={page.id} saved={page.saved} large />}
              </span>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-6 text-hint">
              {page.owner && (
                <Link href={`/organization/people/${page.owner.id}/personal`} className="flex items-center gap-2 text-body text-secondary no-underline hover:underline">
                  <PersonAvatar person={page.owner} />
                  {page.owner.name}
                </Link>
              )}
              <span className="text-tertiary tabular-nums">
                {t("page.version", { version: page.versionNo, date: dates.long(page.updatedAt) })}
                {(agreedNow ?? (page.agreement && page.request === null ? page.agreement.agreedAt : null)) &&
                  t("page.youAgreed", { date: dates.short(agreedNow ?? page.agreement?.agreedAt) })}
              </span>
            </div>
            {keepChanges && page.agreement && <WhatChanged points={page.whatChanged} agreedVersion={page.agreement.versionNo} />}
            <HubDocumentView
              className="mt-12"
              body={page.body}
              changedBlockIds={keepChanges ? page.changedBlockIds : []}
              empty={<p className="mt-12 text-body text-tertiary">{t("page.emptyBody")}</p>}
            />
            {showsAgreeBar(page) && page.request && !agreedNow && <div aria-hidden className="h-12 shrink-0" />}
            {showsAgreeBar(page) && page.request && !agreedNow && (
              <AgreeBar
                versionNo={page.request.versionNo}
                dueOn={page.request.dueOn}
                overdue={page.request.overdue}
                ownerFirstName={firstNameOf(page.owner?.name) || t("page.owner")}
                onAgree={async () => {
                  const result = unwrapHub(await agreeToPageAction({ pageId: page.id, revisionId: page.revisionId ?? "" }));
                  // The bar shows its own quiet line first; the meta line and the hub's counters follow.
                  setTimeout(() => {
                    setAgreedNow(result.agreedAt);
                    void invalidate();
                  }, 5000);
                  return result;
                }}
              />
            )}
          </article>
        )}
      </div>
    </HubPage>
  );
};
