import { getTranslations } from "next-intl/server";

import { ssoService } from "@/api/modules/sso";
import { companyAuthBrand } from "@/api/modules/companyAddress";
import { AuthBack, AuthHeading, AuthSplit } from "@/components/modules/auth/layout";
import { LoginForm } from "@/components/modules/auth/components/LoginContainer";
import { safeReturnPath } from "@/lib/companyAddress";

/**
 * `/login/owner` — the System Owner's way in when the company's single sign-on is required and broken
 * (sign-in-company-login C6). A screen of its own, reached only from the quiet "System Owner login" at the foot of
 * C5/C7; the server refuses the password to anybody else under `REQUIRED` (`AuthService.login`). No login code here.
 */
export const dynamic = "force-dynamic";

const PROVIDER_NAME: Record<string, string> = { OKTA: "Okta", ENTRA: "Microsoft" };

export default async function OwnerLoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  const t = await getTranslations("auth");
  const { brand, subdomain } = await companyAuthBrand();
  const sso = subdomain ? await ssoService.publicSso(subdomain) : null;
  const provider = (sso?.provider && PROVIDER_NAME[sso.provider]) ?? t("company.singleSignOn");

  return (
    <AuthSplit brand={brand} back={<AuthBack href="/login" />}>
      <AuthHeading title={t("company.owner.title")} lead={t("company.owner.lead", { provider })} />
      <LoginForm returnTo={safeReturnPath(next)} />
    </AuthSplit>
  );
}
