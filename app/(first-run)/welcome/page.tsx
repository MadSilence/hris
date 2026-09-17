import { redirect } from "next/navigation";

import { WelcomeContainer } from "@/components/modules/firstRun/components/WelcomeContainer";
import { hrisFirstRunService } from "@/api/modules/firstRun/services";

export const metadata = { title: "Welcome" };

type Props = { searchParams: Promise<{ again?: string }> };

/**
 * An invited person's first screen.
 *
 * <p>Guarded on the server like everything else here: somebody who has already been welcomed — or
 * skipped, which is the same answer — goes straight to the product. `?again` is how they come back
 * on their own terms, from the user menu, rather than being sent here a second time.
 */
export default async function WelcomePage({ searchParams }: Props) {
  const { again } = await searchParams;
  const { setupNeeded, welcomeNeeded } = await hrisFirstRunService.getFirstRunState();

  if (setupNeeded) redirect("/setup");
  if (!welcomeNeeded && again === undefined) redirect("/dashboard");

  return <WelcomeContainer />;
}
