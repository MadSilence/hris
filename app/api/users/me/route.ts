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
