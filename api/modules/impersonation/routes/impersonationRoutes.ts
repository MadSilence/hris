import { NextResponse } from "next/server";
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

    this.setAuthCookies(res, result.accessToken);

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

    this.setAuthCookies(res, result.accessToken);

    return res;
  }

  private setAuthCookies(res: NextResponse, accessToken: string) {
    const isProd = process.env.NODE_ENV === "production";

    res.cookies.set({
      name: "access_token",
      value: accessToken,
      httpOnly: true,
      sameSite: "lax",
      secure: isProd,
      path: "/",
    });

    res.cookies.set({
      name: "has_session",
      value: "1",
      httpOnly: false,
      sameSite: "lax",
      secure: isProd,
      path: "/",
    });
  }
}

export const impersonationRoutes = new ImpersonationRoutes();
