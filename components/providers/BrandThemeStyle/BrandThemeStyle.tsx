import React from "react";
import { cookies } from "next/headers";

import { buildBrandStyleSheet } from "@/lib/theme/brandPalette";
import { hrisCompanyAppearanceService } from "@/api/modules/company/modules/appearance/services";
import { currentCompanySubdomain, publicAppearanceFor } from "@/api/modules/companyAddress";

/**
 * Paints the company's brand before the first frame.
 *
 * This has to be a server component. The company only reaches the client through SWR in
 * `CompanyDataProvider`, which resolves after hydration — colouring from there would flash the
 * default brown on every page load. Rendered from the root layout, the variables are already in the
 * document when the browser paints.
 *
 * **Two sources.** With a session, the company's full appearance, sidebar contrast included. Without
 * one, on a company's own address, the public read the login page renders from — the same cached read,
 * so the colour here and the page's texts are one answer (`technical_documentation/COMPANY_ADDRESSES.md` § 4, "never repainted").
 * On the root without a session there is no company, and the shipped palette is the answer.
 *
 * Fails silently by design: an unbranded company or a backend hiccup mean "keep the shipped palette",
 * decided here on the server. A theme is never worth an error screen.
 */
const BrandThemeStyle: React.FC = async () => {
  const cookieStore = await cookies();
  let styleSheet = "";
  let answeredWithSession = false;

  if (cookieStore.get("access_token")?.value) {
    try {
      const appearance = await hrisCompanyAppearanceService.getAppearance();
      styleSheet = buildBrandStyleSheet(appearance.brandColor, appearance.sidebarContrast);
      answeredWithSession = true;
    } catch {
      styleSheet = "";
    }
  }

  if (!answeredWithSession) {
    // No session, or a session the backend refused: a company's own address still wears its colour.
    const subdomain = await currentCompanySubdomain();
    if (subdomain) {
      const appearance = await publicAppearanceFor(subdomain);
      styleSheet = buildBrandStyleSheet(appearance.brandColor);
    }
  }

  if (!styleSheet) {
    return null;
  }

  return <style data-brand-theme dangerouslySetInnerHTML={{ __html: styleSheet }} />;
};

export default BrandThemeStyle;
