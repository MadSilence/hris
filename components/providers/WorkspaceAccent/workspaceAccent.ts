import { cookies } from "next/headers";

import { hrisCompanyAppearanceService } from "@/api/modules/company/modules/appearance/services";
import { currentCompanySubdomain, publicAppearanceFor } from "@/api/modules/companyAddress";
import { ACCESS_COOKIE } from "@/config/security/sessionCookieNames";

/**
 * The workspace's accent, read on the server so the page wears it before the first frame.
 *
 * The root layout turns the answer into `data-accent` or the derived custom properties on `<html>`
 * (`lib/theme/accent.ts`). It has to be decided here: the company only reaches the client through SWR in
 * `CompanyDataProvider`, which resolves after hydration — colouring from there would flash Wine on every
 * page load of a Denim company.
 *
 * **Two sources.** With a session, the company's appearance. Without one, on a company's own address, the
 * public read the login page renders from — the same cached read, so the colour and the page's texts are one
 * answer (`technical_documentation/COMPANY_ADDRESSES.md` § 4, "never repainted"). On the root without a
 * session there is no company, and the answer is noddo's own: null, which is Wine.
 *
 * Fails silently by design: an unbranded company or a backend hiccup mean the default accent, decided here
 * on the server. A colour is never worth an error screen.
 */
export async function workspaceAccent(): Promise<string | null> {
  const cookieStore = await cookies();

  if (cookieStore.get(ACCESS_COOKIE)?.value) {
    try {
      return (await hrisCompanyAppearanceService.getAppearance()).accent;
    } catch {
      // A session the backend refused: a company's own address can still answer below.
    }
  }

  const subdomain = await currentCompanySubdomain();
  if (!subdomain) return null;

  return (await publicAppearanceFor(subdomain)).accent;
}
