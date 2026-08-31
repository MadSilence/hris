import { formatOf, streamBinary } from "@/api/utils/exportResponse";
import { officeService, OfficeService } from "@/api/modules/office/services/officeService";

export class OfficeRoutes {
  public constructor(private readonly service: OfficeService) {
  }

  public async getOffices() {
    const offices = await this.service.getOffices();
    return Response.json(offices);
  };

  public async exportOffices(req: Request) {
    const backendResponse = await this.service.exportOffices(formatOf(req));
    return streamBinary(backendResponse);
  };

  public async exportOffice(req: Request, id: string) {
    const backendResponse = await this.service.exportOffice(id, formatOf(req));
    return streamBinary(backendResponse);
  };
}

export const officeRoutes = new OfficeRoutes(officeService);
