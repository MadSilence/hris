import { NextResponse } from "next/server";
import { withErrorMiddleware } from "@/api/middleware/errorMiddleware";
import { authRoutes } from "@/api/modules/auth/routes/authRoutes";

export const POST = withErrorMiddleware(async (req) => {
    const payload = await req.json();
    const { accessToken } = await authRoutes.login(payload);

    const res = NextResponse.json({ ok: true }, { status: 200 });
    res.cookies.set({
        name: "access_token",
        value: accessToken,
        httpOnly: true,
        sameSite: "lax",
        path: "/",
    });
    return res;
});
