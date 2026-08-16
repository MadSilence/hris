import { NextRequest } from "next/server";
import { apiRequestWrapper } from "@/api/utils/apiRequestWrapper";
import { roleRoutes } from "@/api/modules/roles/routes/roleRoutes";

// A read that happens to need a body (the selected role ids), so it stays a route handler rather
// than a server action.
export const POST = apiRequestWrapper(async (req: NextRequest) => {
  const body = (await req.json()) as { roleIds?: string[] };

  return roleRoutes.previewRoleAccess(body.roleIds ?? []);
});
