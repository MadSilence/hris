import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

/** The request config `next-intl` reads the locale and catalogue from (technical_documentation/I18N.md § 3). */
const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const nextConfig: NextConfig = {
  distDir: ".next-dev",
};

export default withNextIntl(nextConfig);
