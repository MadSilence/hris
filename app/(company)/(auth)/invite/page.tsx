import { getTranslations } from "next-intl/server";
import { LinkSquare02Icon } from "@hugeicons/core-free-icons";

import { hrisApiAuthService } from "@/api/modules/auth/services/hrisAuthService";
import type { InvitePeekResponse } from "@/api/modules/auth/dto";
import { companyAuthBrand } from "@/api/modules/companyAddress";
import { isSharedProvider } from "@/api/modules/provider";
import { ssoService } from "@/api/modules/sso";
import { InviteAcceptContainer } from "@/components/modules/invitation";
import { AuthHeading, AuthSplit } from "@/components/modules/auth/layout";
import { buttonVariants } from "@/components/desact/button";

type Props = {
  searchParams: Promise<{ token?: string; provider?: string; inUse?: string }>;
};

/**
 * Where an invitation link lands (sign-in-invitation). The link is looked up here without being used, so one that does
 * not open says why — already used, expired, withdrawn, or broken (G5) — instead of offering a form that cannot work.
 */
export default async function InvitePage({ searchParams }: Props) {
  const { token, provider, inUse } = await searchParams;
  const t = await getTranslations("auth");
  const { brand, subdomain } = await companyAuthBrand();
  const company = brand.kind === "company" ? brand : null;

  let invite: InvitePeekResponse | null = null;
  if (token) {
    try {
      invite = await hrisApiAuthService.peekInvite(token);
    } catch {
      invite = null;
    }
  }

  if (!token || !invite || invite.state !== "OPEN" || !company) {
    const state = invite?.state ?? "BROKEN";
    const name = invite?.companyName ?? company?.name ?? "";
    const key = state === "USED" ? "used" : state === "EXPIRED" ? "expired" : state === "WITHDRAWN" ? "withdrawn" : "broken";
    return (
      <AuthSplit brand={brand}>
        <AuthHeading icon={LinkSquare02Icon} title={t(`invite.${key}.title`)} lead={t(`invite.${key}.body`, { company: name })} />
        {state === "USED" && (
          <a href="/login" className={buttonVariants({ size: "lg", className: "w-full" })}>{t("invite.used.action")}</a>
        )}
      </AuthSplit>
    );
  }

  return (
    <InviteAcceptContainer
      brand={company}
      token={token}
      firstName={invite.firstName}
      email={invite.email}
      ssoProvider={invite.ssoProvider === "OTHER" ? t("company.singleSignOn") : invite.ssoProvider}
      providers={subdomain ? (await ssoService.publicSso(subdomain)).sharedProviders : []}
      failure={isSharedProvider(provider) ? { provider, usedElsewhere: inUse === "1" } : null}
    />
  );
}
