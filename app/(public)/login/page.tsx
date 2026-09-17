import { cookies } from "next/headers";

import CompanyAddressStep from "@/components/modules/companyAddress/components/CompanyAddressStep";
import {
  REMEMBERED_COMPANY_COOKIE,
  TYPED_COMPANY_COOKIE,
  readRememberedCompany,
} from "@/api/modules/companyAddress";
import publicConfig from "@/config/publicConfig";

type Props = {
  searchParams: Promise<{ another?: string }>;
};

/**
 * `/login` on the root: "sign in to your company". A company's own `/login` is a different page —
 * `middleware.ts` renders it from `/company-login`.
 *
 * A server page so the remembered company and the addresses are read here and handed down; `another`
 * is set by "Not your company?" on a company's login, which is exactly when offering it back is wrong.
 */
export default async function LoginPage({ searchParams }: Props) {
  const { another } = await searchParams;
  const cookieStore = await cookies();
  const remembered = readRememberedCompany(
    cookieStore.get(REMEMBERED_COMPANY_COOKIE)?.value,
    cookieStore.get(TYPED_COMPANY_COOKIE)?.value,
  );

  return (
    <CompanyAddressStep
      web={publicConfig.web}
      rememberedSubdomain={another === "1" ? null : remembered}
    />
  );
}
