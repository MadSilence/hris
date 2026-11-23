"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { NodRing } from "@/components/desact/nod";
import { EmptyState } from "@/components/feedback/EmptyState";
import { Button } from "@/components/desact/button";
import { SearchBox } from "@/components/ui/SearchBox";
import { useDebouncedValue } from "@/components/modules/organization/modules/profile/hooks/useDebouncedValue";
import type { PostCard } from "@/models/hub";
import { useHubHome, useHubPosts } from "../hooks";
import { BackLink, HubLoadError, HubPage, HubState, HubTitle, LoadingBlock, NewsRow, PinnedPost, SkeletonRows, useHubDates } from "../shared";
import { useFeedScope } from "./HomeParts";
import { FeedScopeSwitch } from "./HubHomeContainer";

type MonthGroup = { key: string; posts: PostCard[] };

/** Posts by the month they went out, newest first — the order the list already has. */
export const groupByMonth = (posts: PostCard[]): MonthGroup[] => {
  const groups: MonthGroup[] = [];
  for (const post of posts) {
    const date = post.publishedAt ? new Date(post.publishedAt) : null;
    const key = date && !Number.isNaN(date.getTime()) ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}` : "unknown";
    const last = groups[groups.length - 1];
    if (last && last.key === key) last.posts.push(post);
    else groups.push({ key, posts: [post] });
  }
  return groups;
};

/**
 * CH02, All news: For me / Everyone, search, the pinned post, then the posts by month — 20 at a time, the next 20 as
 * the reader nears the end. Posts have no type, so there are no type chips (FIXES Q1).
 */
export const NewsContainer: React.FC = () => {
  const t = useTranslations("hub");
  const dates = useHubDates();
  const [scope, setScope] = useFeedScope();
  const [query, setQuery] = React.useState("");
  const q = useDebouncedValue(query.trim(), 300);
  const posts = useHubPosts(scope, q);
  const sentinel = React.useRef<HTMLDivElement>(null);

  const items = React.useMemo(() => posts.data?.pages.flatMap((p) => p.items) ?? [], [posts.data]);
  // The pinned post is the company's one message to everybody: it stays on top under "For me" as well, where the list
  // itself holds only what is written to the reader (WALK_QUESTIONS § 34 (a)). The hub's home answers it either way.
  const home = useHubHome(scope);
  const pinned = !q ? items.find((p) => p.pinned) ?? (scope === "FOR_ME" ? home.data?.pinned ?? null : null) : null;
  const rest = pinned ? items.filter((p) => p.id !== pinned.id) : items;
  const groups = groupByMonth(rest);
  const searched = Boolean(q);

  React.useEffect(() => {
    const el = sentinel.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && posts.hasNextPage && !posts.isFetchingNextPage) void posts.fetchNextPage();
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [posts]);

  const now = new Date();
  const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const monthTitle = (group: MonthGroup) => {
    if (group.key === thisMonth) return t("news.thisMonth");
    const first = group.posts[0]?.publishedAt;
    if (!first) return "";
    return new Date(first).getFullYear() === now.getFullYear() ? dates.month(first) : dates.monthYear(first);
  };

  return (
    <HubPage width="column">
      <BackLink href="/hub" label={t("home.title")} />
      <div className="mt-3 flex items-center gap-4">
        <HubTitle>{t("news.title")}</HubTitle>
        {/* The toolbar search, 240 × 32, as on Automations (the designers' round 2, RC8). */}
        <SearchBox className="ml-auto" value={query} onChange={setQuery} aria-label={t("news.search")} />
      </div>
      <div className="mt-7 flex items-center">
        <FeedScopeSwitch value={scope} onChange={setScope} />
      </div>

      <div className="mt-9 flex flex-1 flex-col gap-8">
        {posts.isLoading ? (
          <LoadingBlock skeleton={<SkeletonRows count={6} height="h-20" />} />
        ) : posts.isError ? (
          <HubLoadError error={posts.error} title={t("news.error")} onRetry={() => void posts.refetch()} />
        ) : items.length === 0 && !pinned ? (
          searched ? (
            // A search, so the magnifier (FIXES U4), centred in the free area under the controls.
            <HubState
              scene="no-results-s"
              size="s"
              title={t("news.noMatch")}
            />
          ) : scope === "FOR_ME" ? (
            <EmptyState
              compact
              scene="announcements"
              title={t("news.forMeEmptyTitle")}
              description=""
              action={
                <Button type="button" variant="link" onClick={() => setScope("ALL")}>
                  {t("news.forMeEmptyAction")}
                </Button>
              }
            />
          ) : (
            <EmptyState scene="announcements" title={t("news.empty")} description="" />
          )
        ) : (
          <>
            {/* Under the pinned post: 28, a hairline, then 28 to the first group (FIXES C3). */}
            {pinned && (
              <div className="-mb-1 border-b border-divider pb-7">
                <PinnedPost post={pinned} wide />
              </div>
            )}
            {groups.map((group) => (
              <section key={group.key} className="flex flex-col gap-1">
                <h2 className="text-hint font-medium text-tertiary">{monthTitle(group)}</h2>
                <ul className="flex flex-col">
                  {group.posts.map((post) => (
                    <NewsRow key={post.id} post={post} withSave />
                  ))}
                </ul>
              </section>
            ))}
            {posts.isFetchingNextPage && (
              <div className="flex justify-center py-4">
                <NodRing />
              </div>
            )}
          </>
        )}
        <div ref={sentinel} aria-hidden className="h-px" />
      </div>
    </HubPage>
  );
};
