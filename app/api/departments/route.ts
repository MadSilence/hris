import { apiRequestWrapper } from "@/api/utils/apiRequestWrapper";
import { departmentsRoutes } from "@/api/modules/departments/routes";

export const GET = apiRequestWrapper(async (req: Request) =>
  departmentsRoutes.list(req),
);

export const POST = apiRequestWrapper(async (req: Request) =>
  departmentsRoutes.create(req),
);
