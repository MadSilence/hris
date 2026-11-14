import CompanyLoginScreen from "@/components/modules/auth/components/CompanyLoginScreen";
import { ssoService } from "@/api/modules/sso";
import { companyAuthBrand } from "@/api/modules/companyAddress";
import publicConfig from "@/config/publicConfig";
import { rootOrigin, safeReturnPath } from "@/lib/companyAddress";

type Props = {
  searchParams: Promise<{ passwordChanged?: string; next?: string; sso?: string; provider?: string; reason?: string; code?: string }>;
};

/**
 * `/login` on a company's own address — `middleware.ts` renders it from here (sign-in-company-login).
 *
 * Dynamic by nature: the page depends on the host. The company's look is read here and in `workspaceAccent` through
 * one cached read, so the colour and the pane are the same answer. `next` is checked on the server and only a page of
 * this app on this host is followed. `reason=ended` is how the API client says a session ran out (N3).
 */
export const dynamic = "force-dynamic";

export default async function CompanyLoginPage({ searchParams }: Props) {
  const { passwordChanged, next, sso: ssoResult, provider, reason, code } = await searchParams;
  const { brand, subdomain } = await companyAuthBrand();
  const sso = subdomain ? await ssoService.publicSso(subdomain) : null;
  const failedProvider = provider === "GOOGLE" || provider === "MICROSOFT" ? provider : null;

  return (
    <CompanyLoginScreen
      brand={brand as Extract<typeof brand, { kind: "company" }>}
      sso={sso}
      providers={sso?.sharedProviders ?? []}
      returnTo={safeReturnPath(next)}
      notice={passwordChanged === "1" ? "passwordChanged" : reason === "ended" ? "loggedOut"
        : code === "other-browser" ? "codeOtherBrowser" : code === "expired" ? "codeExpired" : null}
      failure={ssoResult === "failed" ? { kind: "sso" } : failedProvider ? { kind: "provider", provider: failedProvider } : null}
      changeCompanyHref={`${rootOrigin(publicConfig.web)}/login?another=1`}
    />
  );
}
