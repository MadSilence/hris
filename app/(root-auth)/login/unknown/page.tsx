import CompanyAddressStep from "@/components/modules/companyAddress/components/CompanyAddressStep";
import publicConfig from "@/config/publicConfig";
import { normalizeCompanyAddress } from "@/lib/companyAddress";

/**
 * `<root>/login/unknown?address=…` — "Log in to your company" for an address a company's own page found nobody at: the
 * address typed in, "We can’t find that company…" under it (the designers' login fix R3). A company's login never draws
 * a form for a company that does not exist; it sends the browser here instead (`app/(company-login)/company-login`).
 */
export const dynamic = "force-dynamic";

export default async function UnknownCompanyPage({ searchParams }: { searchParams: Promise<{ address?: string }> }) {
  const { address } = await searchParams;
  return <CompanyAddressStep web={publicConfig.web} remembered={null} unknown={normalizeCompanyAddress(address) || null} />;
}
