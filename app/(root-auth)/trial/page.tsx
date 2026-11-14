import { cookies } from "next/headers";

import { hrisAuthSessionService, type ProviderDraft } from "@/api/modules/auth/services/hrisAuthSessionService";
import { providerService } from "@/api/modules/provider";
import { RegistrationContainer } from "@/components/modules/trial/components/RegistrationContainer";
import { SIGNUP_PROVIDER_COOKIE } from "@/config/security/sessionCookieNames";

/**
 * `<root>/trial` — registering a company (sign-in-registration B1 → B2 → B2a). noddo's own, so Wine. Back from Google
 * or Microsoft, the draft's cookie opens B3 instead — or B3a when it has run out.
 */
export const dynamic = "force-dynamic";

export default async function TrialPage({ searchParams }: { searchParams: Promise<{ provider?: string }> }) {
  const { provider } = await searchParams;
  const failed = provider === "GOOGLE" || provider === "MICROSOFT" ? provider : null;
  const draftToken = (await cookies()).get(SIGNUP_PROVIDER_COOKIE)?.value;

  let draft: ProviderDraft | "expired" | null = null;
  if (draftToken) {
    try {
      draft = await hrisAuthSessionService.registrationProviderDraft(draftToken);
    } catch {
      draft = "expired";
    }
  }

  return (
    <RegistrationContainer
      providers={draft ? [] : await providerService.registrationProviders()}
      failedProvider={failed}
      providerDraft={draft}
    />
  );
}
