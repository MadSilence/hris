import * as React from "react";

import { cn } from "@/lib/cn";
import { TAG_CLASSES, toTagColor } from "@/lib/theme/tags";

/*
 * A tag (SPEC § 13.4): a soft square — radius 6, 24 px (20 in dense tables) — with a 6 px dot in the tag's
 * colour and a 12/16 medium label. Teams, locations, skills, leave types, an option of a list field. The name
 * is always shown: the colour is never the only signal. Show at most three in a row, then "+n".
 */
export function TagChip({
  color,
  children,
  size = "md",
  className,
}: {
  /** A tag colour name; anything unknown is drawn gray. */
  color: string | null | undefined;
  children: React.ReactNode;
  size?: "sm" | "md";
  className?: string;
}) {
  const tag = TAG_CLASSES[toTagColor(color)];
  return (
    <span
      data-slot="tag"
      className={cn(
        "inline-flex w-fit max-w-full shrink-0 items-center gap-1.5 rounded-tag text-hint font-medium whitespace-nowrap",
        size === "sm" ? "h-5 px-1.5" : "h-6 px-2",
        tag.chip,
        className,
      )}
    >
      <span aria-hidden className={cn("size-1.5 shrink-0 rounded-pill", tag.dot)} />
      <span className="truncate">{children}</span>
    </span>
  );
}

/** "+2" after the third tag. */
export function TagOverflow({ count, className }: { count: number; className?: string }) {
  if (count <= 0) return null;
  return <span className={cn("inline-flex h-6 items-center rounded-tag bg-mist px-2 text-hint font-medium text-secondary", className)}>+{count}</span>;
}
