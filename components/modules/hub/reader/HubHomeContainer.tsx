"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { ArrowRight01Icon, File01Icon, Settings02Icon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/desact/button";
import { Icon } from "@/components/desact/icon";
import { Skeleton } from "@/components/desact/skeleton";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { useCanAccess } from "@/components/auth";
import { showActionError } from "@/lib/errors/errorToast";
import { ActionStatus } from "@/components/models/ActionStatus";
import type { FeedScope, HubHome } from "@/models/hub";
import { createHubPageAction } from "../actions";
import { useHubHome } from "../hooks";
import { HubAskBox, HubHeading, HubPage, HubTitle, LoadingBlock, NewsRow, PinnedPost, SkeletonRows, useHubDates } from "../shared";
import { CelebrationStrip } from "./CelebrationStrip";
import { AgreeCallout, HandbookSectionCard, orderSectionCards, SavedPopover, SectionLinkArrow, useFeedScope } from "./HomeParts";

/** The For me / Everyone switch over the news (CH01, CH02). */
export const FeedScopeSwitch: React.FC<{ value: FeedScope; onChange: (next: FeedScope) => void }> = ({ value, onChange }) => {
  const t = useTranslations("hub");
  return (
    <SegmentedControl
      fill={false}
      aria-label={t("news.scopeLabel")}
      value={value}
      onChange={onChange}
      options={[
        { value: "FOR_ME", label: t("news.forMe") },
        { value: "ALL", label: t("news.everyone") },
      ]}
    />
  );
};

const NewsColumn: React.FC<{ home: HubHome; scope: FeedScope; onScope: (next: FeedScope) => void }> = ({ home, scope, onScope }) => {
  const t = useTranslations("hub");
  const rows = home.posts.filter((p) => p.id !== home.pinned?.id).slice(0, home.pinned ? 3 : 4);
  const nothing = !home.pinned && rows.length === 0;
  return (
    <section aria-labelledby="hub-news" className="flex min-w-0 flex-col gap-5">
      <div className="flex h-8 items-center gap-4">
        <HubHeading id="hub-news">{t("news.title")}</HubHeading>
        <span className="ml-auto" />
        <FeedScopeSwitch value={scope} onChange={onScope} />
        <SectionLinkArrow href="/hub/news">{t("news.allNews")}</SectionLinkArrow>
      </div>
      {nothing ? (
        scope === "FOR_ME" ? (
          <EmptyState
            compact
            scene="announcements"
            title={t("news.forMeEmptyTitle")}
            description=""
            action={
              <Button type="button" variant="link" onClick={() => onScope("ALL")}>
                {t("news.forMeEmptyAction")}
              </Button>
            }
          />
        ) : (
          <EmptyState compact scene="announcements" title={t("news.empty")} description="" />
        )
      ) : (
        <>
          {home.pinned && <PinnedPost post={home.pinned} />}
          <ul className="flex flex-col">
            {rows.map((post) => (
              <NewsRow key={post.id} post={post} />
            ))}
          </ul>
        </>
      )}
    </section>
  );
};

const HandbookColumn: React.FC<{ home: HubHome }> = ({ home }) => {
  const t = useTranslations("hub");
  const dates = useHubDates();
  const cards = orderSectionCards(home.sections);
  const more = home.moreSections > 0 ? home.moreSections : Math.max(0, home.sections.length - 6);
  return (
    <section aria-labelledby="hub-handbook" className="flex min-w-0 flex-col gap-5">
      <div className="flex h-8 items-center gap-4">
        <HubHeading id="hub-handbook">{t("handbook.title")}</HubHeading>
        <SectionLinkArrow href="/hub/handbook" className="ml-auto">
          {t("handbook.open")}
        </SectionLinkArrow>
      </div>
      {cards.length === 0 ? (
        <EmptyState compact scene="policies" title={t("handbook.empty")} description="" />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3">
            {cards.map((section) => (
              <HandbookSectionCard key={section.id} section={section} />
            ))}
          </div>
          {more > 0 && (
            <SectionLinkArrow href="/hub/handbook">
              {t("handbook.moreSections", { count: more })}
              <Icon icon={ArrowRight01Icon} size="sm" />
            </SectionLinkArrow>
          )}
          {home.recentlyUpdated.length > 0 && (
            <div className="mt-1 flex flex-col gap-2 border-t border-divider pt-6">
              <p className="text-hint text-tertiary">{t("handbook.recentlyUpdated")}</p>
              <ul className="flex flex-col gap-2">
                {home.recentlyUpdated.slice(0, 3).map((page) => (
                  <li key={page.id} className="flex items-center gap-2 text-body">
                    <Icon icon={File01Icon} size="sm" className="shrink-0 text-tertiary" />
                    <Link href={`/hub/handbook/${page.id}`} className="min-w-0 truncate text-primary underline underline-offset-2">
                      {page.title}
                    </Link>
                    <span className="ml-auto shrink-0 text-hint text-tertiary">
                      {t("handbook.recentMeta", { section: page.sectionName ?? "", date: dates.short(page.updatedAt) })}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </section>
  );
};

/** Creates a draft page and opens it in the editor (CM03 "New page", from anywhere). */
export const useNewPage = () => {
  const router = useRouter();
  const [busy, setBusy] = React.useState(false);
  return {
    busy,
    create: async (sectionId: string | null = null) => {
      setBusy(true);
      const result = await createHubPageAction(sectionId);
      setBusy(false);
      if (result.status === ActionStatus.ERROR || !result.data) {
        showActionError(result);
        return;
      }
      router.push(`/hub/manage/pages/${result.data.id}/edit`);
    },
  };
};

/**
 * CH01, the hub's home: what waits on the reader, the ask box, today's celebrations, then News and the Handbook
 * side by side (7fr / 5fr, 64 apart; stacked under 1280). Each block loads and fails on its own.
 */
export const HubHomeContainer: React.FC = () => {
  const t = useTranslations("hub");
  const router = useRouter();
  const [scope, setScope] = useFeedScope();
  const home = useHubHome(scope);
  const canEdit = useCanAccess("HUB.CONTENT", "EDIT");
  const newPage = useNewPage();
  const data = home.data;
  const manager = Boolean(data?.canManage) || canEdit;
  const emptyHub = data && !data.pinned && data.posts.length === 0 && data.sections.length === 0 && scope === "ALL";

  return (
    <HubPage>
      <div className="flex flex-wrap items-center gap-4">
        <HubTitle>{t("home.title")}</HubTitle>
        {data && <AgreeCallout waiting={data.waiting} />}
        <span className="ml-auto flex items-center gap-2">
          <SavedPopover count={data?.savedCount ?? 0} />
          {manager && (
            <Button asChild variant="ghost" className="gap-1.5">
              <Link href="/hub/manage" className="no-underline">
                <Icon icon={Settings02Icon} size="sm" />
                {t("home.manage")}
              </Link>
            </Button>
          )}
        </span>
      </div>

      <HubAskBox className="mt-8" placeholder={t("ask.placeholder")} />

      {data && <CelebrationStrip flags={data.celebrations} />}

      {home.isLoading ? (
        <LoadingBlock
          className="mt-12"
          skeleton={
            <div className="grid grid-cols-1 gap-16 min-[1280px]:grid-cols-[7fr_5fr]">
              <div className="flex flex-col gap-4">
                <Skeleton className="h-[180px] w-full rounded-panel" />
                <SkeletonRows count={3} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                {Array.from({ length: 6 }, (_, i) => (
                  <Skeleton key={i} className="h-14 rounded-card" />
                ))}
              </div>
            </div>
          }
        />
      ) : home.isError || !data ? (
        <div className="mt-12">
          <ErrorState error={home.error} title={t("home.newsError")} onRetry={() => void home.refetch()} />
        </div>
      ) : emptyHub ? (
        <div className="mt-12">
          <EmptyState
            scene="company-hub"
            title={t("home.emptyTitle")}
            description={t("home.emptyLine")}
            action={
              manager ? (
                <div className="flex gap-3">
                  <Button type="button" onClick={() => router.push("/hub/manage/posts?new=1")}>
                    {t("home.emptyWrite")}
                  </Button>
                  <Button type="button" variant="secondary" loading={newPage.busy} onClick={() => void newPage.create()}>
                    {t("home.emptyAddPage")}
                  </Button>
                </div>
              ) : undefined
            }
          />
        </div>
      ) : (
        <div className="mt-12 grid grid-cols-1 gap-16 min-[1280px]:grid-cols-[7fr_5fr]">
          <NewsColumn home={data} scope={scope} onScope={setScope} />
          <HandbookColumn home={data} />
        </div>
      )}
    </HubPage>
  );
};
