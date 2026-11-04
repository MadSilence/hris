import * as React from "react";

import { cn } from "@/lib/cn";

/*
 * The noddo wordmark (SPEC § 3), drawn from the package's outlined files — never typeset. The last "o" sits
 * 7/40 of the x-height lower: that drop is the nod.
 *
 *   ink      on white and light surfaces: Ink letters, the nod in Wine
 *   white    on Wine or Ink: white letters, the nod in Rose
 *   mono     one colour, `currentColor` — on any other colour, and the gray mark in the sidebar
 *
 * The nod never takes the workspace accent; Wine and Rose are the only colours hard-coded in components, and
 * only here. Below 120 px wide the `heavy` cut (stroke 10) keeps the letters from thinning out; it is picked
 * from the height, since the wordmark is 232 × 68.
 */
const LETTERS =
  "M0 20H8V24A20 20 0 0 1 40 40V60H32V40A12 12 0 0 0 8 40V60H0ZM48 40A20 20 0 1 1 88 40A20 20 0 1 1 48 40ZM56 40A12 12 0 1 0 80 40A12 12 0 1 0 56 40ZM96 40A20 20 0 1 1 136 40A20 20 0 1 1 96 40ZM104 40A12 12 0 1 0 128 40A12 12 0 1 0 104 40ZM128 0H136V60H128ZM144 40A20 20 0 1 1 184 40A20 20 0 1 1 144 40ZM152 40A12 12 0 1 0 176 40A12 12 0 1 0 152 40ZM176 0H184V60H176Z";
const NOD = "M192 47A20 20 0 1 1 232 47A20 20 0 1 1 192 47ZM200 47A12 12 0 1 0 224 47A12 12 0 1 0 200 47Z";

const LETTERS_HEAVY =
  "M-1 20H9V22.111A21 21 0 0 1 41 40V60H31V40A11 11 0 0 0 9 40V60H-1ZM47 40A21 21 0 1 1 89 40A21 21 0 1 1 47 40ZM57 40A11 11 0 1 0 79 40A11 11 0 1 0 57 40ZM95 40A21 21 0 1 1 137 40A21 21 0 1 1 95 40ZM105 40A11 11 0 1 0 127 40A11 11 0 1 0 105 40ZM127 0H137V60H127ZM143 40A21 21 0 1 1 185 40A21 21 0 1 1 143 40ZM153 40A11 11 0 1 0 175 40A11 11 0 1 0 153 40ZM175 0H185V60H175Z";
const NOD_HEAVY = "M191 47A21 21 0 1 1 233 47A21 21 0 1 1 191 47ZM201 47A11 11 0 1 0 223 47A11 11 0 1 0 201 47Z";

const INK = "#0B0B0C";
const WINE = "#6E1630";
const WHITE = "#FFFFFF";
const ROSE = "#F2B8C6";

const COLORS = {
  ink: { letters: INK, nod: WINE },
  white: { letters: WHITE, nod: ROSE },
  mono: { letters: "currentColor", nod: "currentColor" },
} as const;

type NoddoWordmarkProps = Omit<React.ComponentProps<"svg">, "children"> & {
  tone?: keyof typeof COLORS;
  /** Rendered height in pixels; the width follows (232 × 68). */
  height?: number;
};

/** Wordmarks narrower than this use the heavy cut (SPEC § 3). */
const HEAVY_BELOW_WIDTH = 120;

export function NoddoWordmark({ tone = "ink", height = 24, className, ...props }: NoddoWordmarkProps) {
  const heavy = (height * 232) / 68 < HEAVY_BELOW_WIDTH;
  const { letters, nod } = COLORS[tone];
  return (
    <svg
      viewBox={heavy ? "-1 0 234 68" : "0 0 232 68"}
      height={height}
      width={(height * (heavy ? 234 : 232)) / 68}
      role="img"
      aria-label="noddo"
      className={cn("shrink-0", className)}
      {...props}
    >
      <title>noddo</title>
      <path fill={letters} d={heavy ? LETTERS_HEAVY : LETTERS} />
      <path fill={nod} d={heavy ? NOD_HEAVY : NOD} />
    </svg>
  );
}

/** The mark: the nodding "o" in a Wine tile, the ring in Rose (SPEC § 3). */
export function NoddoMark({ size = 32, className, ...props }: Omit<React.ComponentProps<"svg">, "children"> & { size?: number }) {
  return (
    <svg viewBox="0 0 96 96" width={size} height={size} role="img" aria-label="noddo" className={cn("shrink-0", className)} {...props}>
      <title>noddo</title>
      <rect width="96" height="96" rx="22" fill={WINE} />
      <path fill={ROSE} d="M25.5 56A22.5 22.5 0 1 1 70.5 56A22.5 22.5 0 1 1 25.5 56ZM34.5 56A13.5 13.5 0 1 0 61.5 56A13.5 13.5 0 1 0 34.5 56Z" />
    </svg>
  );
}
