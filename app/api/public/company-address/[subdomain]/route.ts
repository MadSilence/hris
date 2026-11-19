import { NextResponse } from "next/server";

import { companyExists } from "@/api/modules/companyAddress";
import { normalizeCompanyAddress } from "@/lib/companyAddress";

type RouteContext = { params: Promise<{ subdomain: string }> };

/**
 * Whether an address belongs to a company, for "Log in to your company" (sign-in-root A1, the designers' login fix R3).
 * Bare, like the other public passthroughs: nobody is signed in, and the answer is what visiting the address would show.
 * `exists: null` — the backend did not answer; the page then follows the address as it always did.
 */
export async function GET(_req: Request, context: RouteContext) {
  const subdomain = normalizeCompanyAddress((await context.params).subdomain);
  if (!subdomain) return NextResponse.json({ exists: false });
  return NextResponse.json({ exists: await companyExists(subdomain) });
}
