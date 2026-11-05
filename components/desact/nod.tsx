import * as React from "react";
import { useTranslations } from "next-intl";

import { cn } from "@/lib/cn";

/*
 * The nod — the brand's only motion (SPEC § 11). The ring drops 7/40 of its height, overshoots, settles,
 * holds and comes back. It is used for loaders, the Approve button and the splash screens, nowhere else;
 * three dots and classic spinners do not exist in noddo (SPEC § 12).
 */

const RING_SIZES = { sm: 16, md: 24, lg: 40 } as const;

export type NodRingProps = Omit<React.ComponentProps<"span">, "children"> & {
  size?: keyof typeof RING_SIZES;
  /** Read by assistive technology. Leave empty only when the text beside the ring already says it. */
  label?: string;
};

/** One nodding ring in the accent: the loader for a wait of 0.3 to 2 seconds (SPEC § 12). */
function NodRing({ size = "md", label: labelProp, className, ...props }: NodRingProps) {
  const t = useTranslations("common");
  const label = labelProp ?? t("states.loadingShort");
  const px = RING_SIZES[size];
  return (
    <span
      role={label ? "status" : undefined}
      aria-label={label || undefined}
      data-slot="nod-ring"
      className={cn("inline-flex shrink-0 items-center justify-center text-accent", className)}
      {...props}
    >
      <svg width={px} height={px} viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle
          cx="12"
          cy="13"
          r="7"
          stroke="currentColor"
          strokeWidth="3"
          className="animate-nod [transform-box:fill-box] [transform-origin:center]"
        />
      </svg>
    </span>
  );
}

/**
 * The ring that precedes the Approve label (assets/icons/noddo_icon_approve-ring.svg). It dips on hover of
 * its button and nods once while the approval is being sent; both come from the button, through
 * `group-hover/approve` and `data-loading`.
 */
function ApproveRing({ className }: { className?: string }) {
  return (
    <svg
      width="16"
      height="18"
      viewBox="0 0 16 18"
      fill="none"
      aria-hidden="true"
      data-slot="approve-ring"
      className={cn("shrink-0 text-approve-ring", className)}
    >
      <circle
        cx="8"
        cy="10"
        r="5"
        stroke="currentColor"
        strokeWidth="2.6"
        className="[transform-box:fill-box] [transform-origin:center] transition-transform duration-(--duration-hover) group-hover/approve:translate-y-[2px] group-data-[loading=true]/approve:animate-nod"
      />
    </svg>
  );
}

export { NodRing, ApproveRing };
