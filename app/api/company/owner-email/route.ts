import { NextResponse } from "next/server";
import { apiRequestWrapper } from "@/api/utils/apiRequestWrapper";
import { ownerEmailService } from "@/api/modules/auth/services/ownerEmailService";

/** Whether the app's banner asks the owner to confirm their address (SIGN_IN_IMPLEMENTATION_DESIGN.md § 6.3). */
export const GET = apiRequestWrapper(async () => NextResponse.json(await ownerEmailService.status()));
