import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { hrisAuthSessionService, type ProviderDraft } from "@/api/modules/auth/services/hrisAuthSessionService";
import { providerService } from "@/api/modules/provider";
import { RegistrationContainer } from "@/components/modules/trial/components/RegistrationContainer";
import { SIGNUP_PROVIDER_COOKIE } from "@/config/security/sessionCookieNames";

/**
 * What `/signup` and `/signup/company` render (sign-in-registration B1–B3a). A server component: the provider draft's
 * cookie is read here. `requireDraft`: `/signup/company` alone.
 */
export async function SignupScreen({ provider, requireDraft = false }: { provider?: string; requireDraft?: boolean }) {
  const failed = provider === "GOOGLE" || provider === "MICROSOFT" ? provider : null;
  const draftToken = (await cookies()).get(SIGNUP_PROVIDER_COOKIE)?.value;
  // B2 and B2a hold the address in the page, not the URL: a reload there starts again at B1.
  if (requireDraft && !draftToken) redirect("/signup");

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
