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
      // Every size `styles/globals.css` declares (`--text-*`). One missing is dropped beside a colour: `text-home-greeting`
      // with `text-primary` left Home's Light greeting at 14 px (the designers' fix L1, 2026-11-18).
      text: [
        "greeting", "page-title", "section-title", "card-title", "body", "label", "hint", "number", "code", "avatar-xs", "avatar-s", "initials", "step-mark",
        "auth-display", "auth-lead", "auth-title", "deck-line", "widget-title",
        "hero-s", "hero-m", "hero-l", "hero-xl", "hero-xxl",
        "home-badge-day", "home-day", "home-greeting", "home-input", "home-micro", "home-pill",
        "home-sentence", "home-sentence-m", "home-sentence-l",
        "hub-celebration", "hub-cover", "hub-doc-title", "hub-heading", "hub-hero", "hub-reading", "hub-stat", "hub-title",
        "hub-pinned", "hub-card", "hub-tile", "hub-ask", "hub-small", "hub-lead",
        "leave-balance", "leave-dates", "profile-name", "profile-job", "account-section",
      ],
      radius: ["tag", "control", "popover", "card", "panel", "pill", "glyph", "leave-dialog"],
      shadow: ["card", "raised", "popover", "dialog", "drag", "focus"],
      "font-weight": ["normal", "medium", "semibold"],
      font: ["sans", "heading", "mono"],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
