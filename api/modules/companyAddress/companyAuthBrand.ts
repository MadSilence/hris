import "server-only";

import type { AuthBrand } from "@/components/modules/auth/layout";
import { currentCompanySubdomain, publicAppearanceFor } from "./currentCompanyAddress";

/**
 * What a company's login screens paint on their pane (sign-in-company-login): the company's name and logo, its
 * background and the logo's colours (sign-in-appearance § "Light"), read on
 * the server through the same cached read as the page's accent, so the pane and the colour are one answer and nothing
 * repaints. An address no company holds falls back to the address itself as the name — the same page a company that
 * configured nothing would get.
 */
export async function companyAuthBrand(): Promise<{ brand: AuthBrand; subdomain: string | null }> {
  const subdomain = await currentCompanySubdomain();
  const appearance = subdomain ? await publicAppearanceFor(subdomain) : null;
  return {
    subdomain,
    brand: {
      kind: "company",
      name: appearance?.name ?? subdomain ?? "",
      logoUrl: appearance?.logoUrl ?? null,
      background: appearance?.background ?? "COLOR",
      logoColors: appearance?.logoColors ?? [],
    },
  };
}
