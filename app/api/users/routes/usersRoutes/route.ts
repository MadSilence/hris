import { apiRequestWrapper } from "@/api/utils/apiRequestWrapper";
import { usersRoutes } from "@/api/modules/users/routes/usersRoutes";

export const GET = apiRequestWrapper(async (req: Request) => usersRoutes.getUsers(req));
export const POST = apiRequestWrapper(async (req: Request) => usersRoutes.search(req));

export const dynamic = "force-dynamic";
