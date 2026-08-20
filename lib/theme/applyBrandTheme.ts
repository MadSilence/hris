import { buildBrandStyleSheet } from "@/lib/theme/brandPalette";

const BRAND_STYLE_SELECTOR = "style[data-brand-theme]";

/**
 * Repaints the app with a new brand colour on the client.
 *
 * The palette normally arrives from `BrandThemeStyle`, a server component in the root layout. Asking
 * the server to re-render it after every save (`router.refresh()`) refetches the whole route tree to
 * change ten CSS variables. Instead this rewrites the very element the server already rendered — same
 * position in the head, same precedence, no refetch. A reload still gets the colour from the server.
 *
 * Clearing the colour removes the element rather than emptying it, so the palette in `globals.css`
 * takes over again.
 */
export const applyBrandTheme = (brandColor: string | null | undefined): void => {
  if (typeof document === "undefined") {
    return;
  }

  const sheet = buildBrandStyleSheet(brandColor);
  const existing = document.head.querySelector<HTMLStyleElement>(BRAND_STYLE_SELECTOR);

  if (!sheet) {
    existing?.remove();
    return;
  }

  const element = existing ?? document.createElement("style");

  if (!existing) {
    element.setAttribute("data-brand-theme", "");
    document.head.appendChild(element);
  }

  element.textContent = sheet;
};
