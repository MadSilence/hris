"use client";

import * as React from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { PinIcon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/desact/icon";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/desact/tooltip";
import { hubFileUrl, type PostCard } from "@/models/hub";
import { cn } from "@/lib/cn";
import { useAudienceLabel, useHubDates } from "./hubText";
import { PersonAvatar, PostTile } from "./hubVisuals";
import { SaveButton } from "./SaveButton";

/** "{author} · {audience}", "{author} · Policy update", "{author} · Event on {d Mon}" (CH01 Row meta). */
export const usePostMeta = () => {
  const t = useTranslations("hub");
  const audience = useAudienceLabel();
  const dates = useHubDates();
  return (post: Pick<PostCard, "type" | "author" | "audienceLabel" | "eventOn">): string => {
    const author = post.author?.name ?? t("news.someone");
    if (post.type === "POLICY_UPDATE") return t("news.metaPolicy", { author });
    if (post.type === "EVENT" && post.eventOn) return t("news.metaEvent", { author, date: dates.short(post.eventOn) });
    return t("news.meta", { author, audience: audience(post.audienceLabel) });
  };
};

/** A title cut with … and a tooltip carrying the whole of it. */
export const TruncatedTitle: React.FC<{ title: string; className?: string }> = ({ title, className }) => (
  <Tooltip>
    <TooltipTrigger asChild>
      <span className={cn("truncate", className)}>{title}</span>
    </TooltipTrigger>
    <TooltipContent>{title}</TooltipContent>
  </Tooltip>
);

/**
 * A post as a row (`NewsRow`, CH01/CH02): the cover thumbnail or the type icon in a 48 tile, the title on one line,
 * the meta under it, the date on the right — and on CH02 the save button, shown on hover and always when saved.
 */
export const NewsRow: React.FC<{ post: PostCard; withSave?: boolean }> = ({ post, withSave = false }) => {
  const t = useTranslations("hub");
  const meta = usePostMeta();
  const dates = useHubDates();
  return (
    <li className="group relative flex h-20 items-center gap-4 border-b border-divider last:border-b-0">
      <PostTile coverFileId={post.coverFileId} type={post.type} size={48} alt={t("news.photo")} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Link href={`/hub/news/${post.id}`} className="flex min-w-0 text-card-title text-primary no-underline after:absolute after:inset-0 hover:underline">
          <TruncatedTitle title={post.title} />
        </Link>
        <span className="truncate text-hint text-tertiary">{meta(post)}</span>
      </div>
      {withSave && (
        <span className={cn("relative z-10", post.saved ? "" : "opacity-0 group-focus-within:opacity-100 group-hover:opacity-100")}>
          <SaveButton type="POST" id={post.id} saved={post.saved} />
        </span>
      )}
      <span className="shrink-0 text-label text-tertiary tabular-nums">{dates.short(post.publishedAt)}</span>
    </li>
  );
};

/**
 * The pinned post (`PinnedPost`, CH01/CH02): a cover 200 × 180 (240 × 200 on CH02) — the image, or a soft tint
 * with the post's date as a hero number — then the Pinned pill, the title, two lines of text and the author.
 */
export const PinnedPost: React.FC<{ post: PostCard; wide?: boolean }> = ({ post, wide = false }) => {
  const t = useTranslations("hub");
  const dates = useHubDates();
  const keyDate = post.eventOn ?? post.publishedAt;
  const day = keyDate ? new Date(post.eventOn ? `${post.eventOn}T00:00:00` : keyDate).getDate() : null;
  return (
    <article className="relative flex gap-6">
      {post.coverFileId ? (
        // eslint-disable-next-line @next/next/no-img-element -- a session-bound hub file
        <img
          src={hubFileUrl(post.coverFileId)}
          alt={t("news.photo")}
          className={cn("shrink-0 rounded-panel object-cover", wide ? "h-[200px] w-[240px]" : "h-[180px] w-[200px]")}
        />
      ) : (
        <div
          aria-hidden
          className={cn(
            "flex shrink-0 flex-col justify-end gap-1 rounded-panel bg-tag-ocean-bg p-5",
            wide ? "h-[200px] w-[240px]" : "h-[180px] w-[200px]",
          )}
        >
          {day !== null && <span className="text-hub-cover text-accent-text tabular-nums">{day}</span>}
          <span className="truncate text-label text-tag-ocean-text">{dates.month(post.eventOn ? `${post.eventOn}T00:00:00` : keyDate)}</span>
        </div>
      )}
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <span className="inline-flex h-6 w-fit items-center gap-1 rounded-pill bg-status-inactive-bg px-2 text-hint font-semibold text-status-inactive-text">
          <Icon icon={PinIcon} size="sm" />
          {t("news.pinned")}
        </span>
        <Link href={`/hub/news/${post.id}`} className="line-clamp-3 text-hub-heading text-primary no-underline after:absolute after:inset-0 hover:underline">
          {post.title}
        </Link>
        {post.excerpt && <p className="line-clamp-2 text-body text-secondary">{post.excerpt}</p>}
        <div className="mt-auto flex items-center gap-2 text-label">
          <PersonAvatar person={post.author} />
          <span className="truncate text-primary">{post.author?.name}</span>
          {post.author?.jobTitle && <span className="truncate text-tertiary">{post.author.jobTitle}</span>}
          <span className="ml-auto shrink-0 text-tertiary tabular-nums">{dates.short(post.publishedAt)}</span>
          {wide && (
            <span className="relative z-10">
              <SaveButton type="POST" id={post.id} saved={post.saved} />
            </span>
          )}
        </div>
      </div>
    </article>
  );
};
