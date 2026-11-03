import React from "react";
import { EyeOff } from "lucide-react";

/**
 * Anonymous peer or upward reviews in but not shown: fewer are in than the cycle's threshold, so the server kept them
 * back (DECISIONS.md § "Performance reviews — the second sitting", Q1; REVIEWS_PLAN.md A6). Only the count reaches
 * this screen.
 */
export function HeldBackNote({ count, threshold, kind = "peer" }: {
  count: number;
  threshold: number | null;
  kind?: "peer" | "upward";
}) {
  if (count <= 0) return null;
  const reviews = count === 1 ? `1 anonymous ${kind} review is in` : `${count} anonymous ${kind} reviews are in`;
  return (
    <p className="flex items-start gap-2 rounded-xl border border-dashed border-brown-200 px-4 py-3 text-sm text-muted-foreground"
      data-test="peers-held-back">
      <EyeOff className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
      <span>
        {reviews} and held back to keep its writers anonymous — shown once there are {threshold ?? 3}.
      </span>
    </p>
  );
}
