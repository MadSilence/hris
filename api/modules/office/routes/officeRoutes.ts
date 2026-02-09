import { officeService, OfficeService } from "@/api/modules/office/services/officeService";

export class OfficeRoutes {
  public constructor(private readonly service: OfficeService) {
  }

  public async getOffices() {
    const offices = await this.service.getOffices();
    return Response.json(offices);
  };
}

export const officeRoutes = new OfficeRoutes(officeService);
