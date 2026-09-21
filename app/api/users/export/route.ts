import { apiRequestWrapper } from "@/api/utils/apiRequestWrapper";
import { usersRoutes } from "@/api/modules/users/routes/usersRoutes/usersRoutes";

/** People export — a POST, because the request is the whole table view. See `usersRoutes.exportUsers`. */
export const POST = apiRequestWrapper(async (req: Request) => usersRoutes.exportUsers(req));
