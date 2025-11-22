import {apiRequestWrapper} from "@/api/utils/apiRequestWrapper";
import {usersRoutes} from "@/api/modules/users/routes/usersRoutes/usersRoutes";

export const GET = apiRequestWrapper(async (req: Request) => usersRoutes.getUsers(req));
