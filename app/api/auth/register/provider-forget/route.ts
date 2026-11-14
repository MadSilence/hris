import { NextResponse, type NextRequest } from "next/server";
import publicConfig from "@/config/publicConfig";
import { requestOrigin } from "@/lib/companyAddress";
import { SIGNUP_PROVIDER_COOKIE } from "@/config/security/sessionCookieNames";

/**
 * B3's *Not you?*: the draft is forgotten and registration starts again at B1. The provider shows its account chooser
 * next time (`prompt=select_account`), so another account can be picked there.
 */
export const GET = async (req: NextRequest) => {
  const res = NextResponse.redirect(new URL("/trial", requestOrigin(req.headers, publicConfig.web)), 303);
  res.cookies.set({ name: SIGNUP_PROVIDER_COOKIE, value: "", httpOnly: true, secure: true, sameSite: "lax", path: "/", maxAge: 0 });
  return res;
};
