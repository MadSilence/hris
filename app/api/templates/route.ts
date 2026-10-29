import { apiRequestWrapper } from "@/api/utils/apiRequestWrapper";
import { templatesRoutes } from "@/api/modules/templates/routes";

/** The catalogue, filtered by Java to the kinds the reader may apply. */
export const GET = apiRequestWrapper(async (req: Request) => templatesRoutes.list(req));
