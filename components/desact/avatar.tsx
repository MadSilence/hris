"use client";

import * as React from "react";
import * as AvatarPrimitive from "@radix-ui/react-avatar";

import { cn } from "@/lib/cn";
import { avatarColor, TAG_CLASSES } from "@/lib/theme/tags";

/*
 * Avatars are round (SPEC § 8). Without a photo a person shows their initials on the soft tag colour chosen
 * by a stable hash of the name (§ 4.7) — never the accent, and never a silhouette. The size comes from the
 * caller: 22 px in the people list, 32 and 40 elsewhere (`--avatar-sm | -md | -lg`).
 *
 * One rule for initials (the designers' widgets fixes A1 and hub A9, 2026-11-19): weight 600 at about a third of
 * the avatar — the `text-initials` role, measured against the avatar itself (it is a size container), so a caller
 * never sets the initials' size. A 2 px ring in the card's colour where faces overlap is the caller's `ring-2
 * ring-card`.
 */
function Avatar({ className, ...props }: React.ComponentProps<typeof AvatarPrimitive.Root>) {
  return (
    <AvatarPrimitive.Root
      data-slot="avatar"
      className={cn("@container relative flex size-10 shrink-0 overflow-hidden rounded-pill", className)}
      {...props}
    />
  );
}

function AvatarImage({ className, ...props }: React.ComponentProps<typeof AvatarPrimitive.Image>) {
  return (
    <AvatarPrimitive.Image data-slot="avatar-image" className={cn("aspect-square size-full object-cover", className)} {...props} />
  );
}

type AvatarFallbackProps = React.ComponentProps<typeof AvatarPrimitive.Fallback> & {
  /** The person's full name; it picks the colour. Without it the initials sit on gray. */
  name?: string | null;
};

function AvatarFallback({ className, name, ...props }: AvatarFallbackProps) {
  const tone = TAG_CLASSES[name ? avatarColor(name) : "gray"].chip;
  return (
    <AvatarPrimitive.Fallback
      data-slot="avatar-fallback"
      className={cn("flex size-full items-center justify-center rounded-pill text-initials select-none", tone, className)}
      {...props}
    />
  );
}

export { Avatar, AvatarImage, AvatarFallback };
