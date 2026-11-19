"use client";

import * as React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/desact/avatar";
import { cn } from "@/lib/cn";

export const initialsOf = (name: string | null | undefined): string =>
  (name ?? "")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

const SIZES = {
  20: "size-5",
  22: "size-[22px]",
  24: "size-6",
  28: "size-7",
  32: "size-8",
  36: "size-9",
  44: "size-11",
  48: "size-12",
  64: "size-16",
} as const;

/**
 * A person's round avatar: their photo, or their initials on the tint their name picks (SPEC § 4.7) — 600 at about a
 * third of the size, whatever the size (the widgets fixes A1, hub A9; `AvatarFallback` measures it). `ring` draws the
 * 2 px ring in the card's colour, for faces that overlap.
 */
export const PersonAvatar: React.FC<{
  name: string | null | undefined;
  avatarUrl?: string | null;
  size?: keyof typeof SIZES;
  ring?: boolean;
  className?: string;
}> = ({ name, avatarUrl, size = 28, ring, className }) => (
  <Avatar className={cn(SIZES[size], ring && "ring-2 ring-card", className)}>
    {avatarUrl ? <AvatarImage src={avatarUrl} alt="" /> : null}
    <AvatarFallback name={name}>
      {initialsOf(name)}
    </AvatarFallback>
  </Avatar>
);
