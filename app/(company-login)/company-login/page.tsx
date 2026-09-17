import CompanyLoginScreen from "@/components/modules/auth/components/CompanyLoginScreen";
import { currentCompanySubdomain, publicAppearanceFor } from "@/api/modules/companyAddress";
import publicConfig from "@/config/publicConfig";
import { rootOrigin, safeReturnPath } from "@/lib/companyAddress";
import { DEFAULT_PUBLIC_COMPANY_APPEARANCE } from "@/models/company/PublicCompanyAppearance";

type Props = {
  searchParams: Promise<{ passwordChanged?: string; next?: string }>;
};

/**
 * `/login` on a company's own address — `middleware.ts` renders it from here, and this route has no
 * address of its own.
 *
 * Dynamic by nature: the page depends on the host, so it can never be built once and corrected in the
 * browser. The appearance is read here and in `BrandThemeStyle` through one cached read, so the colour
 * and the words in this response are the same answer.
 *
 * `next` is where the person was going when the middleware sent them here; it is checked on the server,
 * and only a page of this app on this host is followed.
 */
export const dynamic = "force-dynamic";

export default async function CompanyLoginPage({ searchParams }: Props) {
  const { passwordChanged, next } = await searchParams;
  const subdomain = await currentCompanySubdomain();
  const appearance = subdomain ? await publicAppearanceFor(subdomain) : DEFAULT_PUBLIC_COMPANY_APPEARANCE;

  return (
    <CompanyLoginScreen
      appearance={appearance}
      passwordChanged={passwordChanged === "1"}
      changeCompanyHref={`${rootOrigin(publicConfig.web)}/login?another=1`}
      returnTo={safeReturnPath(next)}
    />
  );
}
