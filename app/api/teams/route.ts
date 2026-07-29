import { apiRequestWrapper } from "@/api/utils/apiRequestWrapper";
import { teamsRoutes } from "@/api/modules/teams/routes";

export const GET = apiRequestWrapper(async (req: Request) =>
  teamsRoutes.list(req),
);
