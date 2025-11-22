import {apiRequestWrapper} from "@/api/utils/apiRequestWrapper";
import {roleRoutes} from "@/api/modules/roles/routes/roleRoutes/roleRoutes";

export const GET = apiRequestWrapper(async () => roleRoutes.getRoles());
