import { apiRequestWrapper } from "@/api/utils/apiRequestWrapper";
import { peopleImportRoutes } from "@/api/modules/peopleImport/routes";

// The upload: a route rather than a server action because of the action body limit — see
// PeopleImportRoutes.
export const POST = apiRequestWrapper(async (req: Request) => peopleImportRoutes.upload(req));
