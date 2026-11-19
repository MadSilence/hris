import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { FinishProfileContainer } from "@/components/modules/firstRun/components/FinishProfileContainer";
import { hrisFirstRunService } from "@/api/modules/firstRun/services";
import { companyAuthBrand } from "@/api/modules/companyAddress";

export async function generateMetadata() {
  const t = await getTranslations("firstRun");
  return { title: t("finishProfile.title") };
}

/**
 * *Finish your profile* (the designers' screen `profile-finish`): the welcome's look, outside the app frame like it.
 *
 * <p>Guarded as the welcome is: a company still being set up goes to its setup, a person not yet welcomed to the
 * welcome, and an actor impersonating somebody to the product — the fields are the person's own to fill.
 */
export default async function FinishProfilePage() {
  const { setupNeeded, welcomeNeeded, impersonating } = await hrisFirstRunService.getFirstRunState();

  if (setupNeeded) redirect("/setup");
  if (impersonating) redirect("/dashboard");
  if (welcomeNeeded) redirect("/welcome");

  const { brand } = await companyAuthBrand();
  const company = brand.kind === "company" ? { name: brand.name, logoUrl: brand.logoUrl ?? null } : { name: "", logoUrl: null };

  return <FinishProfileContainer company={company} />;
}
