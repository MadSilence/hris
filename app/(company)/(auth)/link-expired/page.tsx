import { getTranslations } from "next-intl/server";
import { LinkSquare02Icon } from "@hugeicons/core-free-icons";

import { companyAuthBrand } from "@/api/modules/companyAddress";
import { AuthHeading, AuthSplit } from "@/components/modules/auth/layout";
import { buttonVariants } from "@/components/desact/button";

/**
 * `/link-expired` — where any token page sends a dead link that has nothing better to say (sign-in-link-pages N1).
 * The invitation (G5) and the phone photo (P10) keep their own.
 */
export const dynamic = "force-dynamic";

export default async function LinkExpiredPage() {
  const t = await getTranslations("auth");
  const { brand } = await companyAuthBrand();
  return (
    <AuthSplit brand={brand}>
      <AuthHeading icon={LinkSquare02Icon} title={t("linkPages.brokenTitle")} lead={t("linkPages.brokenBody")} />
      <a href="/login" className={buttonVariants({ size: "lg", className: "w-full" })}>{t("linkPages.goToLogin")}</a>
    </AuthSplit>
  );
}
