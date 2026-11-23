"use client";

import * as React from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { PinIcon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/desact/icon";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/desact/tooltip";
import { hubFileUrl, type PostCard } from "@/models/hub";
import { cn } from "@/lib/cn";
import { useHubDates, useRowAudience } from "./hubText";
import { PersonAvatar, PostTile } from "./hubVisuals";
import { SaveButton } from "./SaveButton";

/** "{author} · {audience}" — the one row meta now that posts have no type (FIXES Q1, H3). */
export const usePostMeta = () => {
  const t = useTranslations("hub");
  const audience = useRowAudience();
  return (post: Pick<PostCard, "author" | "audienceLabel">): string =>
    t("news.meta", { author: post.author?.name ?? t("news.someone"), audience: audience(post.audienceLabel) });
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

/** The Pinned pill (CH01, CH02): 24 high, 12/16 500 secondary on gray, radius 6, the pin 14, 6 apart (FIXES A11). */
export const PinnedPill: React.FC = () => {
  const t = useTranslations("hub");
  return (
    <span className="inline-flex h-6 w-fit items-center gap-1.5 rounded-tag bg-mist px-2 text-hint font-medium text-secondary">
      <Icon icon={PinIcon} size="sm" className="size-3.5" />
      {t("news.pinned")}
    </span>
  );
};

/**
 * A post as a row (`NewsRow`, CH01/CH02): the cover thumbnail or the megaphone in a 48 tile, the title on one line, 4,
 * the meta under it; padding 16 0 and a hairline under every row, the last included (FIXES A10). CH01 ends with the
 * date 13/18 (B7); CH02 with the date 12/16, 16, then the save button — shown on hover and always when saved (C6).
 */
export const NewsRow: React.FC<{ post: PostCard; withSave?: boolean }> = ({ post, withSave = false }) => {
  const t = useTranslations("hub");
  const meta = usePostMeta();
  const dates = useHubDates();
  return (
    <li className="group relative flex items-center gap-4 border-b border-divider py-4">
      <PostTile coverFileId={post.coverFileId} size={48} alt={t("news.photo")} />
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <Link href={`/hub/news/${post.id}`} className="flex min-w-0 text-card-title text-primary no-underline after:absolute after:inset-0 hover:underline">
          <TruncatedTitle title={post.title} />
        </Link>
        <span className="truncate text-hint text-tertiary">{meta(post)}</span>
      </div>
      {withSave ? (
        <span className="flex shrink-0 items-center gap-4">
          <span className="text-hint text-tertiary tabular-nums">{dates.short(post.publishedAt)}</span>
          <span className={cn("relative z-10", post.saved ? "" : "opacity-0 group-focus-within:opacity-100 group-hover:opacity-100 touch:opacity-100")}>
            <SaveButton type="POST" id={post.id} saved={post.saved} />
          </span>
        </span>
      ) : (
        <span className="shrink-0 text-label font-normal text-tertiary tabular-nums">{dates.short(post.publishedAt)}</span>
      )}
    </li>
  );
};

/**
 * The pinned post (`PinnedPost`, CH01/CH02): a cover — the image, or a soft tint with the publish date as the hero
 * number and its month — then the Pinned pill, the title, two lines of text and the author.
 * CH01: cover 200 × 180, 20 to the text, hero 48, title 22/28 (FIXES B3–B6). CH02 (`wide`): cover 220 × 148, hero 52,
 * title 24/30, the date 12/16 then 12 then the save button (C3, C4).
 */
export const PinnedPost: React.FC<{ post: PostCard; wide?: boolean }> = ({ post, wide = false }) => {
  const t = useTranslations("hub");
  const dates = useHubDates();
  const day = post.publishedAt ? new Date(post.publishedAt).getDate() : null;
  const cover = wide ? "h-[148px] w-[220px]" : "h-[180px] w-[200px]";
  return (
    <article className="relative flex gap-5">
      {post.coverFileId ? (
        // eslint-disable-next-line @next/next/no-img-element -- a session-bound hub file
        <img src={hubFileUrl(post.coverFileId)} alt={t("news.photo")} className={cn("shrink-0 rounded-panel object-cover", cover)} />
      ) : (
        <div aria-hidden className={cn("flex shrink-0 flex-col justify-end gap-1 rounded-panel bg-tag-ocean-bg p-5", cover)}>
          {day !== null && <span className={cn("text-accent tabular-nums", wide ? "text-hub-hero" : "text-hub-cover")}>{day}</span>}
          <span className="truncate text-label text-tag-ocean-text">{dates.month(post.publishedAt)}</span>
        </div>
      )}
      <div className="flex min-w-0 flex-1 flex-col">
        <PinnedPill />
        <Link
          href={`/hub/news/${post.id}`}
          className={cn("mt-2.5 line-clamp-3 text-primary no-underline after:absolute after:inset-0 hover:underline", wide ? "text-hub-pinned" : "text-hub-heading")}
        >
          {post.title}
        </Link>
        {post.excerpt && <p className="mt-1.5 line-clamp-2 text-body text-secondary">{post.excerpt}</p>}
        <div className="mt-auto flex items-center gap-2 pt-3">
          <PersonAvatar person={post.author} />
          <span className="truncate text-label text-primary">{post.author?.name}</span>
          {post.author?.jobTitle && <span className="truncate text-hint text-tertiary">{post.author.jobTitle}</span>}
          {wide ? (
            <span className="ml-auto flex shrink-0 items-center gap-3">
              <span className="text-hint text-tertiary tabular-nums">{dates.short(post.publishedAt)}</span>
              <span className="relative z-10">
                <SaveButton type="POST" id={post.id} saved={post.saved} />
              </span>
            </span>
          ) : (
            <span className="ml-auto shrink-0 text-label font-normal text-tertiary tabular-nums">{dates.short(post.publishedAt)}</span>
          )}
        </div>
      </div>
    </article>
  );
};
