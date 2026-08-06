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

const formatOf = (req: Request): "csv" | "xlsx" =>
  new URL(req.url).searchParams.get("format") === "csv" ? "csv" : "xlsx";

const streamBinary = (backendResponse: Response) =>
  new Response(backendResponse.body, {
    status: backendResponse.status,
    headers: {
      "Content-Type": backendResponse.headers.get("content-type") ?? "application/octet-stream",
      "Content-Disposition": backendResponse.headers.get("content-disposition") ?? "attachment",
    },
  });

export const officeRoutes = new OfficeRoutes(officeService);
