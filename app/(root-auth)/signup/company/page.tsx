import { SignupScreen } from "../SignupScreen";

/**
 * `<root>/signup/company` — B2a / B3, "Create your company". Back from Google or Microsoft the draft's cookie opens B3
 * here; without one (a reload after the email path) it starts again at B1.
 */
export const dynamic = "force-dynamic";

export default async function SignupCompanyPage({ searchParams }: { searchParams: Promise<{ provider?: string }> }) {
  const { provider } = await searchParams;
  return <SignupScreen provider={provider} requireDraft />;
}
