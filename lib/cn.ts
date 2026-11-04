import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

/*
 * tailwind-merge resolves a conflict by knowing which classes set the same property. Out of the box it knows
 * Tailwind's default names, not the design system's: it would read `text-body` (a size) and `text-primary`
 * (a colour) as two colours and drop one. The names below are the ones `styles/globals.css` declares.
 */
const twMerge = extendTailwindMerge({
  override: {
    theme: {
      text: ["greeting", "page-title", "section-title", "card-title", "body", "label", "hint", "number", "code"],
      radius: ["tag", "control", "popover", "card", "panel", "pill", "glyph"],
      shadow: ["card", "raised", "popover", "dialog", "drag", "focus"],
      "font-weight": ["normal", "medium", "semibold"],
      font: ["sans", "heading", "mono"],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
