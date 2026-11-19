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
 *
 * <p><b>A scene without an `-s` cut is never shown under M 160</b> (the designers' hub fixes S, 2026-11-19;
 * `technical_documentation/ui/DESIGN_SYSTEM.md` § "Illustrations"): scaled to 96 its 3-unit support lines drop to
 * 1.2 px, under the 2 px minimum. So `size="s"` draws the scene's `-s` cut when it has one, and otherwise the scene
 * itself at 160. Home's widgets are the one exception (`keepSmall`): a widget card has no room for 160.
 */
const WIDTHS = { s: 96, m: 200, l: 360 } as const;
/** The smallest an uncut scene is drawn — M's lower bound. */
const UNCUT_MIN_WIDTH = 160;

/** The scene a size draws: `size="s"` takes the `-s` cut where one exists. */
const sceneFor = (scene: Scene, size: keyof typeof WIDTHS): Scene => {
  if (size !== "s" || scene.endsWith("-s")) return scene;
  const cut = `${scene}-s`;
  return cut in SCENES ? (cut as Scene) : scene;
};

export function Illustration({
  scene,
  size = "m",
  labelled = false,
  keepSmall = false,
  className,
}: {
  scene: Scene;
  size?: keyof typeof WIDTHS;
  labelled?: boolean;
  /** Home's widgets only: an uncut scene stays at 96 (widgets Q). */
  keepSmall?: boolean;
  className?: string;
}) {
  const drawn = sceneFor(scene, size);
  const width = size === "s" && !drawn.endsWith("-s") && !keepSmall ? UNCUT_MIN_WIDTH : WIDTHS[size];
  return (
    <svg
      viewBox="0 0 240 150"
      width={width}
      height={(width * 150) / 240}
      fill="none"
      role={labelled ? "img" : undefined}
      aria-label={labelled ? SCENE_LABELS[drawn] : undefined}
      aria-hidden={labelled ? undefined : true}
      className={cn("shrink-0 text-(--illustration-ring)", className)}
    >
      {SCENES[drawn]}
    </svg>
  );
}
