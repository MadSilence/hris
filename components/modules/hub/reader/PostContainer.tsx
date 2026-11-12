"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Skeleton } from "@/components/desact/skeleton";
import { hubFileUrl } from "@/models/hub";
import { HubDocumentView } from "../document";
import { useHubPost } from "../hooks";
import { BackLink, HubPage, HubReadError, LoadingBlock, PersonAvatar, SaveButton, useHubDates } from "../shared";

/**
 * One post (`/hub/news/{id}`): CP02's reading layout without the agree bar and the version line — the cover full
 * width, the title with its save button, the author and the date, the text at 720.
 */
export const PostContainer: React.FC<{ id: string }> = ({ id }) => {
  const t = useTranslations("hub");
  const dates = useHubDates();
  const post = useHubPost(id);

  return (
    <HubPage>
      <div className="flex max-w-[720px] flex-col">
        <BackLink href="/hub/news" label={t("news.title")} />
        {post.isLoading ? (
          <LoadingBlock
            className="mt-10"
            skeleton={
              <div className="flex flex-col gap-4">
                <Skeleton className="h-10 w-3/4" />
                <Skeleton className="h-4 w-1/3" />
                {Array.from({ length: 6 }, (_, i) => (
                  <Skeleton key={i} className="h-4 w-full" />
                ))}
              </div>
            }
          />
        ) : post.isError || !post.data ? (
          <HubReadError error={post.error} back={{ href: "/hub", label: t("errors.goToHub") }} onRetry={() => void post.refetch()} />
        ) : (
          <article className="mt-10 flex flex-col">
            {post.data.coverFileId && (
              // eslint-disable-next-line @next/next/no-img-element -- a session-bound hub file
              <img src={hubFileUrl(post.data.coverFileId)} alt={t("news.photo")} className="mb-8 max-h-[400px] w-full rounded-panel object-cover" />
            )}
            <div className="flex items-start gap-4">
              <h1 className="min-w-0 flex-1 text-hub-doc-title text-primary">{post.data.title}</h1>
              <SaveButton type="POST" id={post.data.id} saved={post.data.saved} className="mt-2" />
            </div>
            <div className="mt-4 flex items-center gap-2 text-label">
              <PersonAvatar person={post.data.author} />
              <span className="text-primary">{post.data.author?.name}</span>
              {post.data.author?.jobTitle && <span className="text-tertiary">{post.data.author.jobTitle}</span>}
              <span className="ml-auto text-tertiary tabular-nums">{dates.long(post.data.publishedAt)}</span>
            </div>
            <HubDocumentView className="mt-10" body={post.data.body} />
          </article>
        )}
      </div>
    </HubPage>
  );
};
