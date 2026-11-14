import { NextResponse } from "next/server";
import { apiRequestWrapper } from "@/api/utils/apiRequestWrapper";
import { personalSignInService } from "@/api/modules/identity/services";

/** *My Preferences → Ways to log in*: the password and the connected accounts. */
export const GET = apiRequestWrapper(async () => NextResponse.json(await personalSignInService.overview()));
