import { apiRequestWrapper } from "@/api/utils/apiRequestWrapper";
import { usersRoutes } from "@/api/modules/users/routes/usersRoutes";

export const GET = apiRequestWrapper(async () => usersRoutes.getFields());
