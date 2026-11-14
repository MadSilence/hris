import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { WelcomeContainer, type WelcomeReturn } from "@/components/modules/firstRun/components/WelcomeContainer";
import { hrisFirstRunService } from "@/api/modules/firstRun/services";
import { companyAuthBrand } from "@/api/modules/companyAddress";
import { isSharedProvider } from "@/api/modules/provider";

export async function generateMetadata() {
  const t = await getTranslations("firstRun");
  return { title: t("welcome.metaTitle") };
}

type Props = { searchParams: Promise<{ again?: string; provider?: string; inUse?: string }> };

/**
 * An invited person's first screen.
 *
 * <p>Guarded on the server like everything else here: somebody who has already been welcomed — or
 * skipped, which is the same answer — goes straight to the product. `?again` is how they come back
 * on their own terms, from the user menu, rather than being sent here a second time.
 *
 * <p>`?provider=connected`, `?provider=GOOGLE` and `&inUse=1` are W1's answers, back from Connect's round trip
 * (`/api/auth/provider/finish`). The company's name and logo are read here, so the first frame already shows them.
 */
export default async function WelcomePage({ searchParams }: Props) {
  const { again, provider, inUse } = await searchParams;
  const { setupNeeded, welcomeNeeded, impersonating } = await hrisFirstRunService.getFirstRunState();

  if (setupNeeded) redirect("/setup");
  // The welcome is the person's own, even with `?again`: an actor impersonating them neither lands
  // here nor may open it by hand, or they could finish or skip it on the person's behalf.
  if (impersonating) redirect("/dashboard");
  if (!welcomeNeeded && again === undefined) redirect("/dashboard");

  const { brand } = await companyAuthBrand();
  const company = brand.kind === "company" ? { name: brand.name, logoUrl: brand.logoUrl ?? null } : { name: "", logoUrl: null };
  const returned: WelcomeReturn = provider === "connected"
    ? { kind: "connected" }
    : isSharedProvider(provider)
      ? { kind: inUse === "1" ? "inUse" : "failed", provider }
      : null;

  return <WelcomeContainer company={company} returned={returned} />;
}
