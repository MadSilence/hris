"use client";

import * as React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/desact/button";
import { EmptyState, NoResults } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { SearchBox } from "@/components/ui/SearchBox";
import { useDebouncedValue } from "@/components/modules/organization/modules/profile/hooks/useDebouncedValue";
import type { ManagePostRow, PostStatusFilter } from "@/models/hub";
import { useManagePosts } from "../../hooks";
import { LoadingBlock, SkeletonRows } from "../../shared";
import { ManageFrame } from "../ManageFrame";
import { ManagePostRowView } from "./PostRow";
import { PostEditorDialog } from "./PostEditorDialog";

/** How many posts each status tab holds. */
export const countByStatus = (posts: ManagePostRow[]): Record<PostStatusFilter, number> => ({
  ALL: posts.length,
  PUBLISHED: posts.filter((p) => p.status === "PUBLISHED").length,
  SCHEDULED: posts.filter((p) => p.status === "SCHEDULED").length,
  DRAFT: posts.filter((p) => p.status === "DRAFT").length,
});

/**
 * Which post CM05 shows, kept in the address (`?new=1`, `?edit={id}`) so a duplicate can open its copy and the
 * hub's empty state can open a new post.
 */
export const usePostDialog = () => {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const editId = params.get("edit");
  const isNew = params.get("new") === "1";
  const open = isNew || Boolean(editId);
  const set = (next: { edit?: string; new?: boolean } | null) => {
    const search = new URLSearchParams(params.toString());
    search.delete("edit");
    search.delete("new");
    if (next?.edit) search.set("edit", next.edit);
    if (next?.new) search.set("new", "1");
    const text = search.toString();
    router.replace(text ? `${pathname}?${text}` : pathname, { scroll: false });
  };
  return {
    open,
    postId: editId,
    openNew: () => set({ new: true }),
    openEdit: (id: string) => set({ edit: id }),
    close: () => set(null),
  };
};

/** CM02, Posts: every post by status, searchable, each with its row menu. Writing is only through New post. */
export const PostsContainer: React.FC = () => {
  const t = useTranslations("hub");
  const dialog = usePostDialog();
  const params = useSearchParams();
  // CM01's Drafts tile opens this tab on Drafts.
  const [status, setStatus] = React.useState<PostStatusFilter>(params.get("status") === "DRAFT" ? "DRAFT" : "ALL");
  const [query, setQuery] = React.useState("");
  const q = useDebouncedValue(query.trim(), 300);
  const posts = useManagePosts("ALL", q);
  const all = posts.data ?? [];
  const counts = countByStatus(all);
  const shown = status === "ALL" ? all : all.filter((p) => p.status === status);

  const emptyTab = status === "DRAFT" ? t("manage.posts.noDrafts") : status === "SCHEDULED" ? t("manage.posts.noScheduled") : t("manage.posts.noPublished");

  return (
    <ManageFrame
      actions={
        <Button type="button" onClick={dialog.openNew}>
          {t("manage.newPost")}
        </Button>
      }
    >
      <div className="flex max-w-[960px] flex-col gap-6">
        <div className="flex flex-wrap items-center gap-4">
          <SegmentedControl<PostStatusFilter>
            fill={false}
            aria-label={t("manage.tabs.posts")}
            value={status}
            onChange={setStatus}
            options={[
              { value: "ALL", label: t("manage.posts.all", { count: counts.ALL }) },
              { value: "PUBLISHED", label: t("manage.posts.published", { count: counts.PUBLISHED }) },
              { value: "SCHEDULED", label: t("manage.posts.scheduled", { count: counts.SCHEDULED }) },
              { value: "DRAFT", label: t("manage.posts.drafts", { count: counts.DRAFT }) },
            ]}
          />
          <SearchBox className="ml-auto w-60" value={query} onChange={setQuery} aria-label={t("manage.posts.search")} />
        </div>
        {posts.isLoading ? (
          <LoadingBlock skeleton={<SkeletonRows count={6} height="h-20" />} />
        ) : posts.isError ? (
          <ErrorState error={posts.error} title={t("manage.posts.error")} onRetry={() => void posts.refetch()} />
        ) : all.length === 0 && !q ? (
          <EmptyState scene="announcements" title={t("manage.posts.emptyTitle")} description={t("manage.posts.emptyLine")} onCreate={dialog.openNew} createLabel={t("manage.newPost")} />
        ) : shown.length === 0 ? (
          q ? (
            <NoResults title={t("manage.nothingMatches", { text: q })} hint="" onClearSearch={() => setQuery("")} />
          ) : (
            <EmptyState compact scene="announcements" title={emptyTab} description="" />
          )
        ) : (
          <ul className="flex flex-col">
            {shown.map((post) => (
              <ManagePostRowView key={post.id} post={post} onEdit={dialog.openEdit} />
            ))}
          </ul>
        )}
      </div>
      <PostEditorDialog open={dialog.open} postId={dialog.postId} onOpenChange={(open) => !open && dialog.close()} />
    </ManageFrame>
  );
};
