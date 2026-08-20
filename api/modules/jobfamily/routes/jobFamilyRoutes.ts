import { jobFamilyService, JobFamilyService } from "@/api/modules/jobfamily/services/jobFamilyService";

export class JobFamilyRoutes {
  public constructor(private readonly service: JobFamilyService) {
  }

  public async getJobFamilies() {
    const jobFamilies = await this.service.getJobFamilies();
    return Response.json(jobFamilies);
  }

  /** Binary passthrough — the only transport that can stream the spreadsheet back. */
  public async exportJobCatalog(req: Request) {
    const backendResponse = await this.service.exportJobCatalog(formatOf(req));
    return new Response(backendResponse.body, {
      status: backendResponse.status,
      headers: {
        "Content-Type": backendResponse.headers.get("content-type") ?? "application/octet-stream",
        "Content-Disposition": backendResponse.headers.get("content-disposition") ?? "attachment",
      },
    });
  }
}

const formatOf = (req: Request): "csv" | "xlsx" =>
  new URL(req.url).searchParams.get("format") === "csv" ? "csv" : "xlsx";

export const jobFamilyRoutes = new JobFamilyRoutes(jobFamilyService);
