import { SignupScreen } from "./SignupScreen";

/**
 * `<root>/signup` — registering a company (sign-in-registration B1 → B2 `/signup/verify` → B2a `/signup/company`; the
 * designers' login fix B1). noddo's own, so Wine. Back from Google or Microsoft, the draft's cookie opens B3 instead —
 * or B3a when it has run out. `/trial`, its old address, redirects here (`hostRouting.ts`).
 *
 * Google and Microsoft are offered when the installation has their applications configured (`GET
 * /public/shared-providers`, `ProviderRoundTrip.offered`); without them B1 is the email form alone.
 */
export const dynamic = "force-dynamic";

export default async function SignupPage({ searchParams }: { searchParams: Promise<{ provider?: string }> }) {
  const { provider } = await searchParams;
  return <SignupScreen provider={provider} />;
}
