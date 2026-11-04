import * as React from "react";

import { cn } from "@/lib/cn";
import { SCENE_LABELS, SCENES, type Scene } from "./scenes";

/*
 * A ring illustration (SPEC § 10). Static — the nod belongs to loaders and Approve. Never alone: it heads an
 * empty state, an error page or a success screen, above a title, a line of text and an action.
 *
 *   s   96 px    panels, dropdowns, module headers (use the `-s` cuts, which drop the support lines)
 *   m   200 px   empty pages and tabs — the default
 *   l   360 px   onboarding, success, the website
 *
 * Decorative by default: the title beside it says the same thing. Pass `labelled` when it stands for content.
 */
const WIDTHS = { s: 96, m: 200, l: 360 } as const;

export function Illustration({
  scene,
  size = "m",
  labelled = false,
  className,
}: {
  scene: Scene;
  size?: keyof typeof WIDTHS;
  labelled?: boolean;
  className?: string;
}) {
  const width = WIDTHS[size];
  return (
    <svg
      viewBox="0 0 240 150"
      width={width}
      height={(width * 150) / 240}
      fill="none"
      role={labelled ? "img" : undefined}
      aria-label={labelled ? SCENE_LABELS[scene] : undefined}
      aria-hidden={labelled ? undefined : true}
      className={cn("shrink-0 text-(--illustration-ring)", className)}
    >
      {SCENES[scene]}
    </svg>
  );
}
