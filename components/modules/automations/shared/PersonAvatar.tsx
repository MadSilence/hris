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

const SIZES = { 24: "size-6 text-hint", 28: "size-7 text-hint", 32: "size-8 text-hint" } as const;

/** A person's round avatar: their photo, or their initials on the colour their name picks (SPEC § 4.7). */
export const PersonAvatar: React.FC<{
  name: string | null | undefined;
  avatarUrl?: string | null;
  size?: keyof typeof SIZES;
  className?: string;
}> = ({ name, avatarUrl, size = 28, className }) => (
  <Avatar className={cn(SIZES[size], className)}>
    {avatarUrl ? <AvatarImage src={avatarUrl} alt="" /> : null}
    <AvatarFallback name={name}>{initialsOf(name)}</AvatarFallback>
  </Avatar>
);
