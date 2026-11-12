"use client";

import * as React from "react";
import {
  Book02Icon,
  Briefcase01Icon,
  Building03Icon,
  Calendar03Icon,
  Clock01Icon,
  Coffee02Icon,
  File01Icon,
  Globe02Icon,
  HeartCheckIcon,
  Home01Icon,
  LaptopIcon,
  Megaphone01Icon,
  Shield01Icon,
  SparklesIcon,
  UserGroupIcon,
} from "@hugeicons/core-free-icons";
import { Icon, type IconSvgElement } from "@/components/desact/icon";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/desact/avatar";
import { TAG_CLASSES, toTagColor, type TagColor } from "@/lib/theme/tags";
import { hubFileUrl, type PersonRef, type PostType } from "@/models/hub";
import { cn } from "@/lib/cn";

/**
 * The icons a section or page may carry (CM06 "Change icon"): Hugeicons, never emoji (product rule 28). Stored by
 * key; a key the app does not know is drawn as a page.
 */
export const HUB_ICONS = {
  file: File01Icon,
  book: Book02Icon,
  building: Building03Icon,
  briefcase: Briefcase01Icon,
  shield: Shield01Icon,
  heart: HeartCheckIcon,
  globe: Globe02Icon,
  home: Home01Icon,
  laptop: LaptopIcon,
  coffee: Coffee02Icon,
  calendar: Calendar03Icon,
  people: UserGroupIcon,
  megaphone: Megaphone01Icon,
  clock: Clock01Icon,
  sparkles: SparklesIcon,
} as const satisfies Record<string, IconSvgElement>;
export type HubIconKey = keyof typeof HUB_ICONS;
export const HUB_ICON_KEYS = Object.keys(HUB_ICONS) as HubIconKey[];
const isHubIconKey = (key: string | null | undefined): key is HubIconKey => Boolean(key) && Object.prototype.hasOwnProperty.call(HUB_ICONS, key as string);
export const hubIcon = (key: string | null | undefined): IconSvgElement => (isHubIconKey(key) ? HUB_ICONS[key] : File01Icon);

/** A section's colour is one of the package's eight tag colours (`company-hub-manage` Changes to SPEC 4). */
export const HUB_COLORS: readonly TagColor[] = ["gray", "berry", "plum", "indigo", "ocean", "teal", "cocoa", "bronze"];

/** The post type's icon (CH01 rows): an announcement, a policy update, an event. */
export const POST_TYPE_ICONS: Record<PostType, IconSvgElement> = {
  ANNOUNCEMENT: Megaphone01Icon,
  POLICY_UPDATE: File01Icon,
  EVENT: Calendar03Icon,
};

const TILE_SIZES = {
  24: { box: "size-6 rounded-tag", icon: "sm" as const },
  32: { box: "size-8 rounded-popover", icon: "sm" as const },
  40: { box: "size-10 rounded-tint", icon: "md" as const },
  44: { box: "size-11 rounded-tint", icon: "md" as const },
  48: { box: "size-12 rounded-tint", icon: "md" as const },
  52: { box: "size-[52px] rounded-card", icon: "lg" as const },
};

/** An icon on a soft tile in a tag colour — sections, pages, and (on Mist) post types. */
export const IconTile: React.FC<{
  icon: IconSvgElement;
  color?: string | null;
  /** Mist instead of a tag colour (a post's type on CH01). */
  mist?: boolean;
  size: keyof typeof TILE_SIZES;
  dot?: boolean;
  className?: string;
}> = ({ icon, color, mist, size, dot, className }) => {
  const s = TILE_SIZES[size];
  const tag = TAG_CLASSES[toTagColor(color)];
  return (
    <span className={cn("relative flex shrink-0 items-center justify-center", s.box, mist ? "bg-mist text-secondary" : tag.chip, className)}>
      <Icon icon={icon} size={s.icon} />
      {dot && <span aria-hidden className="absolute -top-0.5 -right-0.5 size-2 rounded-pill bg-accent ring-2 ring-card" />}
    </span>
  );
};

/** A post's cover as a thumbnail in its tile, or its type icon on Mist. */
export const PostTile: React.FC<{ coverFileId: string | null; type: PostType; size: 48 | 56; alt: string }> = ({ coverFileId, type, size, alt }) =>
  coverFileId ? (
    // eslint-disable-next-line @next/next/no-img-element -- a session-bound hub file
    <img src={hubFileUrl(coverFileId)} alt={alt} className={cn("shrink-0 object-cover", size === 48 ? "size-12 rounded-tint" : "size-14 rounded-card")} />
  ) : (
    <span className={cn("flex shrink-0 items-center justify-center bg-mist text-secondary", size === 48 ? "size-12 rounded-tint" : "size-14 rounded-card")}>
      <Icon icon={POST_TYPE_ICONS[type]} size="md" />
    </span>
  );

const initialsOf = (name: string) =>
  name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part.charAt(0).toUpperCase()).join("") || "?";

export const PersonAvatar: React.FC<{ person: Pick<PersonRef, "name" | "avatarUrl"> | null; size?: 22 | 28 | 32 | 40; className?: string }> = ({
  person,
  size = 22,
  className,
}) => {
  const name = person?.name ?? "";
  const box = { 22: "size-[22px]", 28: "size-7", 32: "size-8", 40: "size-10" }[size];
  return (
    <Avatar className={cn(box, "shrink-0", className)}>
      {person?.avatarUrl && <AvatarImage src={person.avatarUrl} alt="" />}
      <AvatarFallback name={name} className="text-hint">
        {initialsOf(name)}
      </AvatarFallback>
    </Avatar>
  );
};

/** A 6 px progress bar: accent on Mist (CM01, CM03, CM08). */
export const ProgressBar: React.FC<{ value: number; max: number; className?: string; label?: string }> = ({ value, max, className, label }) => {
  const share = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  return (
    <span
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={value}
      aria-label={label}
      className={cn("block h-1.5 overflow-hidden rounded-pill bg-mist", className)}
    >
      <span className="block h-full rounded-pill bg-accent" style={{ width: `${share}%` }} />
    </span>
  );
};
