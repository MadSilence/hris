import { apiRequestWrapper } from "@/api/utils/apiRequestWrapper";
import { firstRunRoutes } from "@/api/modules/firstRun/routes";

export const GET = apiRequestWrapper(async () => firstRunRoutes.getSetupCountries());
