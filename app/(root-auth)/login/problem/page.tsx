import { getTranslations } from "next-intl/server";
import { Alert02Icon } from "@hugeicons/core-free-icons";

import { AuthHeading, AuthSplit } from "@/components/modules/auth/layout";
import { buttonVariants } from "@/components/desact/button";

/**
 * `/login/problem` — a provider's round trip that cannot be sent back anywhere: the request is unknown or has run out,
 * so nobody knows which company the person came from (sign-in-provider E3). On the root's look; *Go to login* is A1.
 */
export default async function ProviderProblemPage() {
  const t = await getTranslations("auth");
  return (
    <AuthSplit brand={{ kind: "noddo" }}>
      <AuthHeading icon={Alert02Icon} title={t("provider.problemTitle")} lead={t("provider.problemBody")} />
      <a href="/login" className={buttonVariants({ size: "lg", className: "w-full" })}>{t("linkPages.goToLogin")}</a>
    </AuthSplit>
  );
}
