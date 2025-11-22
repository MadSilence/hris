import { NextResponse } from "next/server";

export const POST = async () => {
    const res = NextResponse.json({ ok: true });
    res.cookies.set({ name: "access_token", value: "", path: "/", httpOnly: true, maxAge: 0 });
    return res;
};
