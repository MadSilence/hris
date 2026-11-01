import { apiRequestWrapper } from "@/api/utils/apiRequestWrapper";
import { mfaRoutes } from "@/api/modules/mfa/routes";

export const GET = apiRequestWrapper(async () => mfaRoutes.status());
