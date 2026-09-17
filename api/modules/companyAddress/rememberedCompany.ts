import type { NextResponse } from "next/server";

import publicConfig from "@/config/publicConfig";
import { normalizeCompanyAddress } from "@/lib/companyAddress";

/**
 * The company a browser last signed in to, so "sign in to your company" can offer it back.
 *
 * **Only the address, and only on this browser.** It is written after a successful sign-in — so it is
 * an address that works — on the parent domain, which is the one place both the company's host (that
 * writes it) and the root (that reads it) can reach. It holds no credential and says nothing a person
 * could not read in their own address bar.
 *
 * Signing out leaves it: the next visit to the root is exactly when it is wanted.
 */
export const REMEMBERED_COMPANY_COOKIE = "last_company";

/**
 * The second source is `TYPED_COMPANY_COOKIE`: the address last typed into "sign in to your company",
 * written by that page on the root's own host.
 *
 * It exists because the first one cannot reach the root locally. Browsers refuse `Domain=localhost` —
 * `localhost` is a top-level name to them — so on `*.localhost` the parent-domain cookie is dropped on the
 * floor (seen live 2026-09-15). On a real domain both exist, and the one written after a successful
 * sign-in wins, because it is an address that worked.
 */
export { TYPED_COMPANY_COOKIE } from "@/lib/companyAddress";

/** Chrome caps a cookie's lifetime at 400 days; a year is well inside it. */
const REMEMBER_FOR_SECONDS = 365 * 24 * 60 * 60;

/** `localhost:3000` → `localhost`. A cookie's domain carries no port. */
const cookieDomain = (): string => publicConfig.web.rootDomain.split(":")[0] ?? publicConfig.web.rootDomain;

export const rememberCompany = (res: NextResponse, subdomain: string): void => {
  res.cookies.set({
    name: REMEMBERED_COMPANY_COOKIE,
    value: subdomain,
    domain: cookieDomain(),
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: REMEMBER_FOR_SECONDS,
  });
};

const asAddress = (value: string | undefined): string | null => {
  if (!value) return null;
  const address = normalizeCompanyAddress(value);
  return address && address === value ? address : null;
};

/**
 * The remembered address, or null when there is none or it is not one an address can be. The address
 * of a successful sign-in first, then the last one typed on the root.
 */
export const readRememberedCompany = (signedIn: string | undefined, typed?: string | undefined): string | null =>
  asAddress(signedIn) ?? asAddress(typed);
