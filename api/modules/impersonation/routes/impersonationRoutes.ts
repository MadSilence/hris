import { NextResponse } from "next/server";

import { setSessionCookies } from "@/api/modules/auth/services/sessionCookies";
import { hrisApiImpersonationService } from "@/api/modules/impersonation/services/hrisImpersonationService";

export class ImpersonationRoutes {
  public async start(req: Request) {
    const body = await req.json().catch(() => ({}));

    const result = await hrisApiImpersonationService.start({
      targetUserId: body.targetUserId,
    });

    const res = NextResponse.json(
      {
        ok: true,
        impersonating: result.impersonating,
        actorId: result.actorId,
        subjectId: result.subjectId,
      },
      { status: 200 }
    );

    this.setAuthCookies(res, result.accessToken, result.refreshToken);

    return res;
  }

  public async stop(_req: Request) {
    const result = await hrisApiImpersonationService.stop();

    const res = NextResponse.json(
      {
        ok: true,
        impersonating: result.impersonating,
        actorId: result.actorId,
        subjectId: result.subjectId,
      },
      { status: 200 }
    );

    this.setAuthCookies(res, result.accessToken, result.refreshToken);

    return res;
  }

  /**
   * Through the same helper login uses, so the three cookies cannot drift apart.
   *
   * This wrote `access_token` and `has_session` by hand, without `maxAge` — session cookies, thrown
   * away when the browser closes while a long-lived refresh token stayed behind — and never touched
   * `refresh_token` at all, so an impersonated session kept the *actor's* and silently reverted to
   * them on the first renewal.
   *
   * The backend issues a refresh token for the impersonated subject and sends it as a `Set-Cookie`
   * of its own. **It is now forwarded; it previously was not, and the comment here said it was.**
   * The client used the plain `post`, which discards the response, so the header never reached this
   * method — and one refresh in the browser turned an impersonated session back into the actor's
   * while the banner still read "Stop Impersonation". Confirmed in a browser before it was fixed.
   */
  private setAuthCookies(res: NextResponse, accessToken: string, refreshToken?: string) {
    setSessionCookies(res, { accessToken, refreshToken });
  }
}

export const impersonationRoutes = new ImpersonationRoutes();
