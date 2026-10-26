import { apiRequestWrapper } from "@/api/utils/apiRequestWrapper";
import { peopleImportRoutes } from "@/api/modules/peopleImport/routes";

export const GET = apiRequestWrapper(async (req: Request) => peopleImportRoutes.template(req));
