"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { NodRing } from "@/components/desact/nod";
import { ErrorState } from "@/components/feedback/ErrorState";
import { EmptyState, NoResults } from "@/components/feedback/EmptyState";
import { Button } from "@/components/desact/button";
import { FilterChip } from "@/components/ui/FilterChip";
import { SearchBox } from "@/components/ui/SearchBox";
import { useDebouncedValue } from "@/components/modules/organization/modules/profile/hooks/useDebouncedValue";
import type { PostCard, PostType } from "@/models/hub";
import { useHubPosts } from "../hooks";
import { BackLink, HubPage, HubTitle, LoadingBlock, NewsRow, PinnedPost, SkeletonRows, useHubDates } from "../shared";
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

const TYPES: (PostType | null)[] = [null, "ANNOUNCEMENT", "POLICY_UPDATE", "EVENT"];

/**
 * CH02, All news: For me / Everyone, the type chips, search, the pinned post, then the posts by month — 20 at a time,
 * the next 20 as the reader nears the end.
 */
export const NewsContainer: React.FC = () => {
  const t = useTranslations("hub");
  const dates = useHubDates();
  const [scope, setScope] = useFeedScope();
  const [type, setType] = React.useState<PostType | null>(null);
  const [query, setQuery] = React.useState("");
  const q = useDebouncedValue(query.trim(), 300);
  const posts = useHubPosts(scope, type, q);
  const sentinel = React.useRef<HTMLDivElement>(null);

  const items = React.useMemo(() => posts.data?.pages.flatMap((p) => p.items) ?? [], [posts.data]);
  const pinned = !q && !type ? items.find((p) => p.pinned) ?? null : null;
  const rest = pinned ? items.filter((p) => p.id !== pinned.id) : items;
  const groups = groupByMonth(rest);
  const filtered = Boolean(q) || type !== null;

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

  const typeLabel = (value: PostType | null) =>
    value === null ? t("news.types.all") : value === "ANNOUNCEMENT" ? t("news.types.announcements") : value === "POLICY_UPDATE" ? t("news.types.policyUpdates") : t("news.types.events");

  return (
    <HubPage width="column">
      <BackLink href="/hub" label={t("home.title")} />
      <div className="mt-3 flex items-center gap-4">
        <HubTitle>{t("news.title")}</HubTitle>
        <SearchBox className="ml-auto w-60" value={query} onChange={setQuery} aria-label={t("news.search")} />
      </div>
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <FeedScopeSwitch value={scope} onChange={setScope} />
        <span aria-hidden className="h-6 w-px bg-divider" />
        {TYPES.map((value) => (
          <FilterChip key={value ?? "all"} selected={type === value} onClick={() => setType(value)}>
            {typeLabel(value)}
          </FilterChip>
        ))}
      </div>

      <div className="mt-8 flex flex-col gap-8">
        {posts.isLoading ? (
          <LoadingBlock skeleton={<SkeletonRows count={6} height="h-20" />} />
        ) : posts.isError ? (
          <ErrorState error={posts.error} title={t("news.error")} onRetry={() => void posts.refetch()} />
        ) : items.length === 0 ? (
          filtered ? (
            <NoResults
              scene="no-match-s"
              title={t("news.noMatch")}
              hint=""
              action={
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setQuery("");
                    setType(null);
                  }}
                >
                  {t("news.clearFilters")}
                </Button>
              }
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
            {pinned && <PinnedPost post={pinned} wide />}
            {groups.map((group) => (
              <section key={group.key} className="flex flex-col gap-1">
                <h2 className="text-card-title text-primary">{monthTitle(group)}</h2>
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
