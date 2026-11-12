"use client";

import * as React from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { FileAddIcon, Megaphone01Icon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/desact/button";
import { Icon } from "@/components/desact/icon";
import { Skeleton } from "@/components/desact/skeleton";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import type { Overview, OverviewPage } from "@/models/hub";
import { cn } from "@/lib/cn";
import { useHubOverview } from "../hooks";
import { HubHeading, LoadingBlock, ProgressBar, useHubDates } from "../shared";
import { useNewPage } from "../reader/HubHomeContainer";
import { ManageFrame } from "./ManageFrame";
import { ManagePostRowView, PostEditorDialog, usePostDialog } from "./posts";
import { useRemind } from "./remind";

/** A compact stat tile (`StatTile`, product rule 35): the label, the number, one line of hint. Pending tint only. */
export const StatTile: React.FC<{ label: string; value: React.ReactNode; hint: string; href: string; pending?: boolean }> = ({
  label,
  value,
  hint,
  href,
  pending = false,
}) => (
  <Link
    href={href}
    className={cn(
      "flex h-[116px] flex-col rounded-panel px-5 pt-4 pb-4 no-underline transition-colors",
      pending ? "bg-status-pending-bg text-status-pending-text hover:brightness-95" : "bg-mist hover:bg-divider",
    )}
  >
    <span className={cn("text-hint", pending ? "text-status-pending-text" : "text-tertiary")}>{label}</span>
    <span className={cn("mt-2 text-hub-stat tabular-nums", pending ? "text-status-pending-text" : "text-primary")}>{value}</span>
    <span className={cn("mt-auto truncate text-hint", pending ? "text-status-pending-text" : "text-secondary")}>{hint}</span>
  </Link>
);

/** The tiles' hints, from the overview's numbers (CM01 Words). */
export const useOverviewHints = () => {
  const t = useTranslations("hub");
  const dates = useHubDates();
  const lastMonth = new Date();
  lastMonth.setDate(1);
  lastMonth.setMonth(lastMonth.getMonth() - 1);
  const month = dates.month(lastMonth.toISOString());
  return (o: Overview) => {
    const diff = o.postsThisMonth - o.postsLastMonth;
    return {
      posts:
        o.postsThisMonth === 0 && o.postsLastMonth === 0
          ? t("manage.tiles.noPosts")
          : diff > 0
            ? t("manage.tiles.more", { count: diff, month })
            : diff < 0
              ? t("manage.tiles.fewer", { count: -diff, month })
              : t("manage.tiles.same", { month }),
      drafts:
        o.scheduled === 0
          ? o.drafts === 0
            ? t("manage.tiles.noDrafts")
            : t("manage.tiles.nothingScheduled")
          : o.scheduled === 1
            ? t("manage.tiles.oneScheduled", { date: dates.short(o.nearestScheduled) })
            : t("manage.tiles.manyScheduled", { count: o.scheduled, date: dates.short(o.nearestScheduled) }),
      mustRead: o.openMustRead === 0 ? t("manage.tiles.noMustRead") : t("manage.tiles.agreedOf", { agreed: o.openAgreed, needed: o.openNeeded }),
      missed:
        o.missedPeople === 0
          ? t("manage.tiles.onTime")
          : o.missedPages > 1
            ? t("manage.tiles.missedPages", { count: o.missedPages })
            : (o.missedPageTitle ?? ""),
    };
  };
};

const MustReadRow: React.FC<{ page: OverviewPage }> = ({ page }) => {
  const t = useTranslations("hub");
  const dates = useHubDates();
  const remind = useRemind();
  return (
    <li className="relative flex items-center gap-4 border-b border-divider py-3 last:border-b-0">
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <div className="flex items-baseline gap-3">
          <Link href={`/hub/manage/pages/${page.id}/agreed`} className="min-w-0 truncate text-card-title text-primary no-underline after:absolute after:inset-0 hover:underline">
            {page.title}
          </Link>
          <span className="ml-auto shrink-0 text-hint text-secondary tabular-nums">{t("manage.agreedOf", { agreed: page.agreed, needed: page.needed })}</span>
        </div>
        <ProgressBar value={page.agreed} max={page.needed} />
        {page.pastDeadline ? (
          <span className="text-hint text-status-pending-text">{t("manage.deadlineWas", { date: dates.short(page.dueOn) })}</span>
        ) : (
          <span className="text-hint text-tertiary">{t("manage.due", { date: dates.short(page.dueOn) })}</span>
        )}
      </div>
      {page.remindable > 0 && (
        <Button type="button" variant="secondary" size="sm" className="relative z-10" onClick={() => remind(page.id, [], page.remindable)}>
          {t("manage.remindN", { count: page.remindable })}
        </Button>
      )}
    </li>
  );
};

/** CM01, Overview: four tiles, the newest posts, and the open must-read pages with Remind. */
export const OverviewContainer: React.FC = () => {
  const t = useTranslations("hub");
  const overview = useHubOverview();
  const hints = useOverviewHints();
  const dialog = usePostDialog();
  const newPage = useNewPage();
  const o = overview.data;

  return (
    <ManageFrame
      actions={
        <>
          <Button type="button" variant="secondary" className="gap-1.5" onClick={dialog.openNew}>
            <Icon icon={Megaphone01Icon} size="sm" />
            {t("manage.newPost")}
          </Button>
          <Button type="button" variant="secondary" className="gap-1.5" loading={newPage.busy} onClick={() => void newPage.create()}>
            <Icon icon={FileAddIcon} size="sm" />
            {t("manage.newPage")}
          </Button>
        </>
      }
    >
      {overview.isLoading ? (
        <LoadingBlock
          skeleton={
            <div className="grid grid-cols-2 gap-5 xl:grid-cols-4">
              {[0, 1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-[116px] rounded-panel" />
              ))}
            </div>
          }
        />
      ) : overview.isError || !o ? (
        <ErrorState error={overview.error} onRetry={() => void overview.refetch()} />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-5 xl:grid-cols-4">
            <StatTile label={t("manage.tiles.postsThisMonth")} value={o.postsThisMonth} hint={hints(o).posts} href="/hub/manage/posts" />
            <StatTile label={t("manage.tiles.drafts")} value={o.drafts} hint={hints(o).drafts} href="/hub/manage/posts?status=DRAFT" />
            <StatTile label={t("manage.tiles.mustReadOpen")} value={o.openMustRead} hint={hints(o).mustRead} href="/hub/manage/pages" />
            <StatTile
              label={t("manage.tiles.missed")}
              value={t("manage.tiles.people", { count: o.missedPeople })}
              hint={hints(o).missed}
              pending={o.missedPeople > 0}
              href={o.missedPages === 1 && o.missedPageId ? `/hub/manage/pages/${o.missedPageId}/agreed` : "/hub/manage/pages"}
            />
          </div>
          <div className="mt-10 grid grid-cols-1 gap-16 min-[1280px]:grid-cols-[7fr_5fr]">
            <section className="flex min-w-0 flex-col gap-4" aria-labelledby="hub-overview-posts">
              <div className="flex items-center">
                <HubHeading id="hub-overview-posts">{t("manage.postsColumn")}</HubHeading>
                <Link href="/hub/manage/posts" className="ml-auto text-label text-accent-text no-underline hover:underline">
                  {t("manage.allPosts")}
                </Link>
              </div>
              {o.latestPosts.length === 0 ? (
                <EmptyState compact scene="announcements" title={t("manage.posts.emptyTitle")} description="" onCreate={dialog.openNew} createLabel={t("manage.newPost")} />
              ) : (
                <ul className="flex flex-col">
                  {o.latestPosts.slice(0, 3).map((post) => (
                    <ManagePostRowView key={post.id} post={post} compact onEdit={dialog.openEdit} />
                  ))}
                </ul>
              )}
            </section>
            <section className="flex min-w-0 flex-col gap-4" aria-labelledby="hub-overview-mustread">
              <div className="flex items-center">
                <HubHeading id="hub-overview-mustread">{t("manage.mustReadColumn")}</HubHeading>
                <Link href="/hub/manage/pages" className="ml-auto text-label text-accent-text no-underline hover:underline">
                  {t("manage.allPages")}
                </Link>
              </div>
              {o.mustRead.length === 0 ? (
                <EmptyState compact scene="policies" title={t("manage.noMustRead")} description={t("manage.noMustReadLine")} />
              ) : (
                <ul className="flex flex-col">
                  {o.mustRead.slice(0, 3).map((page) => (
                    <MustReadRow key={page.id} page={page} />
                  ))}
                </ul>
              )}
            </section>
          </div>
        </>
      )}
      <PostEditorDialog open={dialog.open} postId={dialog.postId} onOpenChange={(open) => !open && dialog.close()} />
    </ManageFrame>
  );
};
