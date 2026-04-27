import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { decodeJwt } from "jose";
import { apiRequestWrapper } from "@/api/utils/apiRequestWrapper";

export const GET = apiRequestWrapper(async () => {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;

  if (!accessToken) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const payload = decodeJwt(accessToken);

  return NextResponse.json({
    id: String(payload.sub ?? payload.id ?? ""),
  });
});
