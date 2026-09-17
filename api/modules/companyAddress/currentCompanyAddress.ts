import * as React from "react";
import { headers } from "next/headers";

import publicConfig from "@/config/publicConfig";
import { type HostKind, parseHost, requestHost } from "@/lib/companyAddress";
import { hrisCompanyAppearanceService } from "@/api/modules/company/modules/appearance/services";
import {
  DEFAULT_PUBLIC_COMPANY_APPEARANCE,
  type PublicCompanyAppearance,
} from "@/models/company/PublicCompanyAppearance";

/**
 * React's per-request memoisation. Server components run on the React Next ships for the App Router,
 * which has it; the React in `node_modules` (18, what jest loads) does not, and there the functions
 * below simply run each time they are called.
 */
const cache: <F extends (...args: never[]) => unknown>(fn: F) => F =
  (React as { cache?: <F>(fn: F) => F }).cache ?? ((fn) => fn);

/**
 * Server-side only: which host this request came to.
 *
 * Cached per request, so the layout, the page and anything else rendered for one response read the host
 * once and cannot disagree about it.
 */
export const currentHost = cache(async (): Promise<HostKind> =>
  parseHost(requestHost(await headers()), publicConfig.web.rootDomain),
);

/** The company this request was made to, or null on the root. */
export const currentCompanySubdomain = async (): Promise<string | null> => {
  const host = await currentHost();
  return host.kind === "company" ? host.subdomain : null;
};

/**
 * The login page's appearance for an address, read once per request.
 *
 * **One read for the whole response.** `BrandThemeStyle` in the root layout paints the colour and the
 * login page renders the texts and the background; both come through here, so the colour in `<head>`
 * and the headline in `<body>` are the same answer. Two reads could straddle a save and paint a page
 * that changes on the next load.
 *
 * Fails to the defaults, on the server: a backend hiccup gives the shipped login page in the first frame,
 * never a default that is later replaced.
 */
export const publicAppearanceFor = cache(async (subdomain: string): Promise<PublicCompanyAppearance> => {
  try {
    return await hrisCompanyAppearanceService.getPublicAppearance(subdomain);
  } catch {
    return DEFAULT_PUBLIC_COMPANY_APPEARANCE;
  }
});
