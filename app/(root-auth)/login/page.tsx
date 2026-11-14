import { cookies } from "next/headers";

import CompanyAddressStep from "@/components/modules/companyAddress/components/CompanyAddressStep";
import {
  publicAppearanceFor,
  REMEMBERED_COMPANY_COOKIE,
  TYPED_COMPANY_COOKIE,
  readRememberedCompany,
} from "@/api/modules/companyAddress";
import publicConfig from "@/config/publicConfig";

type Props = {
  searchParams: Promise<{ another?: string }>;
};

/**
 * `/login` on the root: "Log in to your company" (sign-in-root A1, A2). A company's own `/login` is a different page —
 * `middleware.ts` renders it from `/company-login`.
 *
 * A server page, so the remembered company is read here and handed down with its public name and logo (A2) — the same
 * read its own login page makes, for the one address this browser already knows. `another` is set by "Not your
 * company?" on a company's login, which is exactly when offering it back is wrong.
 */
export const dynamic = "force-dynamic";

export default async function LoginPage({ searchParams }: Props) {
  const { another } = await searchParams;
  const cookieStore = await cookies();
  const subdomain = another === "1" ? null : readRememberedCompany(
    cookieStore.get(REMEMBERED_COMPANY_COOKIE)?.value,
    cookieStore.get(TYPED_COMPANY_COOKIE)?.value,
  );
  const appearance = subdomain ? await publicAppearanceFor(subdomain) : null;

  return (
    <CompanyAddressStep
      web={publicConfig.web}
      remembered={subdomain ? { subdomain, name: appearance?.name ?? null, logoUrl: appearance?.logoUrl ?? null } : null}
    />
  );
}
