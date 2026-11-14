import { SetUpTwoStepContainer } from "@/components/modules/auth/components/SecondStep";
import { companyAuthBrand } from "@/api/modules/companyAddress";
import { safeReturnPath } from "@/lib/companyAddress";

/** `/login/set-up-two-step` on a company's address (sign-in-second-step) — the challenge waits in its cookie. */
export const dynamic = "force-dynamic";

export default async function Page({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  const { brand } = await companyAuthBrand();
  return <SetUpTwoStepContainer brand={brand} returnTo={safeReturnPath(next)} />;
}
