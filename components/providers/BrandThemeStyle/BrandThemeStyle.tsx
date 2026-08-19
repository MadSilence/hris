import React from "react";
import { cookies } from "next/headers";

import { buildBrandStyleSheet } from "@/lib/theme/brandPalette";
import { hrisCompanyAppearanceService } from "@/api/modules/company/modules/appearance/services";

/**
 * Paints the company's brand before the first frame.
 *
 * This has to be a server component. The company only reaches the client through SWR in
 * `CompanyDataProvider`, which resolves after hydration — colouring from there would flash the
 * default brown on every page load. Rendered from the root layout, the variables are already in the
 * document when the browser paints.
 *
 * Fails silently by design: no session, an unbranded company, or a backend hiccup all mean "keep the
 * shipped palette". A theme is never worth an error screen.
 */
const BrandThemeStyle: React.FC = async () => {
  const cookieStore = await cookies();

  if (!cookieStore.get("access_token")?.value) {
    return null;
  }

  let styleSheet = "";

  try {
    const appearance = await hrisCompanyAppearanceService.getAppearance();
    styleSheet = buildBrandStyleSheet(appearance.brandColor);
  } catch {
    return null;
  }

  if (!styleSheet) {
    return null;
  }

  return <style data-brand-theme dangerouslySetInnerHTML={{ __html: styleSheet }} />;
};

export default BrandThemeStyle;
