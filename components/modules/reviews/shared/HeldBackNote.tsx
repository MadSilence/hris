import React from "react";
import { ViewOffSlashIcon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/desact/icon";

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
    <p className="flex items-start gap-2 rounded-card border border-dashed border-divider px-4 py-3 text-body text-tertiary"
      data-test="peers-held-back">
      <Icon icon={ViewOffSlashIcon} size="sm" className="mt-0.5 shrink-0" />
      <span>
        {reviews} and held back to keep its writers anonymous — shown once there are {threshold ?? 3}.
      </span>
    </p>
  );
}
