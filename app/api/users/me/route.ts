import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { decodeJwt } from "jose";
import { apiRequestWrapper } from "@/api/utils/apiRequestWrapper";

type HrisJwtPayload = {
  sub?: string;
  id?: string;
  act?: string;
  imp?: boolean;
};

/**
 * Who the current session says it is — decoded from the cookie, on this server, without asking Java.
 *
 * That is right for what it is for: the impersonation banner needs a subject and an actor, and a
 * round trip for two claims already in the token would be waste.
 *
 * **It is not a session check and must never be used as one.** `decodeJwt` does not verify the
 * signature and does not look at `exp`, so this answers 200 for a token Java would reject outright.
 * It was the session probe in `internalApiClient` for exactly that reason — and made the logout
 * redirect unreachable for every revoked session. The probe is `/api/me/access` now, because that
 * one asks Java.
 */
export const GET = apiRequestWrapper(async () => {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;

  if (!accessToken) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const payload = decodeJwt(accessToken) as HrisJwtPayload;

  const userId = String(payload.sub ?? payload.id ?? "");
  const impersonating = Boolean(payload.imp);

  return NextResponse.json({
    id: userId,
    impersonating,
    actorId: payload.act ? String(payload.act) : undefined,
    subjectId: userId,
  });
});
