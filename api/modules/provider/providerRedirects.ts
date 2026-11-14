import { NextResponse } from "next/server";
import publicConfig from "@/config/publicConfig";
import { PROVIDER_BACK_COOKIE, PROVIDER_ORIGIN_COOKIE, SSO_STATE_COOKIE } from "@/config/security/sessionCookieNames";
import { rootOrigin } from "@/lib/companyAddress";

/** The page shown when a round trip cannot be sent back anywhere (sign-in-provider E3). */
export const PROVIDER_PROBLEM_PATH = "/login/problem";

const ROUND_TRIP_COOKIE = { httpOnly: true, secure: true, sameSite: "lax" as const, path: "/" };

/** Ten minutes, the life of the round trip's row. */
const ROUND_TRIP_SECONDS = 10 * 60;

type RoundTripCookie = typeof PROVIDER_ORIGIN_COOKIE | typeof PROVIDER_BACK_COOKIE | typeof SSO_STATE_COOKIE;


export const keepCookie = (res: NextResponse, name: RoundTripCookie, value: string): void => {
  res.cookies.set({ name, value, ...ROUND_TRIP_COOKIE, maxAge: ROUND_TRIP_SECONDS });
};

export const dropCookie = (res: NextResponse, name: RoundTripCookie): void => {
  res.cookies.set({ name, value: "", ...ROUND_TRIP_COOKIE, maxAge: 0 });
};

/**
 * E3 — on the root's own address, which the auth host is an alias of: nobody knows which company the person came
 * from, so the only way on is the root's login (A1).
 */
export const providerProblem = (): NextResponse => {
  const res = NextResponse.redirect(`${rootOrigin(publicConfig.web)}${PROVIDER_PROBLEM_PATH}`, 303);
  dropCookie(res, SSO_STATE_COOKIE);
  return res;
};
