import { redirect } from "next/navigation";

import { CompanySetupContainer } from "@/components/modules/firstRun/components/CompanySetupContainer";
import { hrisFirstRunService } from "@/api/modules/firstRun/services";
import { hrisApiCompanyService } from "@/api/modules/company/services/hrisCompanyService";

export const metadata = { title: "Set up your company" };

/**
 * The owner's first screen.
 *
 * <p>Guarded on the server the same way the app is: a company that is already set up has nothing to
 * ask, and leaving this page reachable would offer to seed a running company a second time.
 *
 * <p>The company's name is read here too, rather than from the client-side provider, because the
 * heading says it — and a provider that answers a moment later rewrites the first sentence of the
 * product in front of the person reading it.
 */
export default async function SetupPage() {
  const { setupNeeded } = await hrisFirstRunService.getFirstRunState();
  if (!setupNeeded) redirect("/dashboard");

  let companyName: string | null = null;
  try {
    companyName = (await hrisApiCompanyService.getCompany()).name ?? null;
  } catch {
    // A heading without a name still works; a setup screen that failed to render does not.
  }

  return <CompanySetupContainer companyName={companyName} />;
}
