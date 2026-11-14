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
          // The Content-Security-Policy is not here: it carries a nonce made per request, so `middleware.ts` sets it
          // (`lib/security`), `frame-ancestors 'none'` included. This header keeps the same rule for older browsers
          // and for the files the middleware does not see.
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          // Browsers ignore it over plain http, so local development is unaffected.
          { key: "Strict-Transport-Security", value: "max-age=31536000" },
          // Not `no-referrer`: it turns the Origin of a form POST into `null`, which Server Actions refuse.
          // `same-origin` still keeps the token in /invite and /login/reset URLs off other sites.
          { key: "Referrer-Policy", value: "same-origin" },
        ],
      },
    ];
  },
};

export default withNextIntl(nextConfig);
