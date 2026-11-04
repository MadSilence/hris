import type { MetadataRoute } from "next";

import { currentCompanySubdomain, publicAppearanceFor } from "@/api/modules/companyAddress";
import { deriveAccentInputs, resolveAccent, ACCENT_PRESETS } from "@/lib/theme/accent";

/*
 * The web manifest (SPEC § 14): one for the product, and one per workspace whose `theme_color` is the
 * company's accent. On the root it is noddo's, Wine; on `acme.<root>` the same manifest in Acme's colour.
 *
 * The name and the icon stay noddo's on a company's address too: the manifest is read without a session, and
 * the company's name is not public there (`PublicCompanyAppearanceDTO`). A workspace's own name and icon are
 * an open question of the redesign (NEED_TO_DISCUSS).
 */
export const dynamic = "force-dynamic";

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const subdomain = await currentCompanySubdomain();
  const stored = subdomain ? (await publicAppearanceFor(subdomain)).accent : null;
  const accent = resolveAccent(stored);
  const themeColor = accent.kind === "preset" ? ACCENT_PRESETS[accent.preset] : deriveAccentInputs(accent.hex).properties["--accent-base"];

  return {
    name: "noddo",
    short_name: "noddo",
    start_url: "/dashboard",
    display: "standalone",
    background_color: "#FFFFFF",
    theme_color: themeColor,
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml" },
      { src: "/brand/noddo-appicon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/brand/noddo-appicon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png" },
    ],
  };
}
