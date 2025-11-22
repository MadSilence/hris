import {apiRequestWrapper} from "@/api/utils/apiRequestWrapper";
import {usersRoutes} from "@/api/modules/users/routes/usersRoutes/usersRoutes";

export const POST = apiRequestWrapper(async (req: Request) => usersRoutes.searchUsers(req));
