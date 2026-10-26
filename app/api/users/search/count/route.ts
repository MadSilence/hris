import { apiRequestWrapper } from "@/api/utils/apiRequestWrapper";
import { usersRoutes } from "@/api/modules/users/routes/usersRoutes";

export const POST = apiRequestWrapper(async (req: Request) => usersRoutes.searchCount(req));
