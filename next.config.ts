import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

/** The request config `next-intl` reads the locale and catalogue from (technical_documentation/I18N.md § 3). */
const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const nextConfig: NextConfig = {
  distDir: ".next-dev",
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Content-Security-Policy", value: "frame-ancestors 'none'" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          // Not `no-referrer`: it turns the Origin of a form POST into `null`, which Server Actions refuse.
          // `same-origin` still keeps the token in /invite and /reset-password URLs off other sites.
          { key: "Referrer-Policy", value: "same-origin" },
        ],
      },
    ];
  },
};

export default withNextIntl(nextConfig);
