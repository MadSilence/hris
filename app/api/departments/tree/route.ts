import { apiRequestWrapper } from "@/api/utils/apiRequestWrapper";
import { departmentsRoutes } from "@/api/modules/departments/routes";

export const GET = apiRequestWrapper(async (req: Request) =>
  departmentsRoutes.tree(req),
);
