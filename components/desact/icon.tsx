import * as React from "react";
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";

import { cn } from "@/lib/cn";

/*
 * The one way to draw an icon (SPEC § 9, icons.md): Hugeicons Stroke Rounded, stroke 1.75, 16 / 20 / 24 px.
 * Icons take the text colour; a status icon takes its status colour through `className`.
 *
 *   <Icon icon={Calendar03Icon} />                 20 px, the default (buttons, navigation, menus)
 *   <Icon icon={Calendar03Icon} size="sm" />       16 px, dense tables and chips
 *   <Icon icon={Calendar03Icon} size="lg" />       24 px, page headers and empty states
 *
 * An icon that means something on its own needs `label`; one beside a word is decoration and stays hidden.
 */
export type IconSize = "sm" | "md" | "lg";

const PIXELS: Record<IconSize, number> = { sm: 16, md: 20, lg: 24 };

export type IconProps = Omit<React.ComponentProps<"svg">, "ref" | "strokeWidth"> & {
  icon: IconSvgElement;
  size?: IconSize;
  label?: string;
  /** 1.75 everywhere; a check inside a 16 px checkbox is the one place that draws heavier. */
  strokeWidth?: number;
};

function Icon({ icon, size = "md", label, strokeWidth = 1.75, className, ...props }: IconProps) {
  return (
    <HugeiconsIcon
      icon={icon}
      size={PIXELS[size]}
      strokeWidth={strokeWidth}
      data-slot="icon"
      className={cn("shrink-0", className)}
      aria-hidden={label ? undefined : true}
      aria-label={label}
      role={label ? "img" : undefined}
      {...props}
    />
  );
}

export { Icon };
export type { IconSvgElement };
