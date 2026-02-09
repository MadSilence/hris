import { apiRequestWrapper } from "@/api/utils/apiRequestWrapper";
import { officeRoutes } from "@/api/modules/office/routes/officeRoutes";

export const GET = apiRequestWrapper(async () => officeRoutes.getOffices());
