import { hrisApiReportsService } from "@/api/modules/reports/services";
import { formatOf, streamBinary } from "@/api/utils/exportResponse";
import type {
  ReportDataset,
  ReportDrilldownRequest,
  ReportDriversRequest,
  ReportExportRequest,
  ReportRunRequest,
  ReportRunUnsavedRequest,
  ReportShareRequest,
} from "@/api/modules/reports/dto";

const DATASETS: ReportDataset[] = ["PEOPLE", "TIME_OFF", "ATTENDANCE", "LIFECYCLE", "REVIEWS"];

/**
 * A body that is not JSON is read as empty and passed on: Java validates every request and answers what an
 * empty one deserves, so nothing is checked or defaulted here.
 */
const bodyOf = async <T>(request: Request): Promise<T> =>
  ((await request.json().catch(() => ({}))) as T | null) ?? ({} as T);

/**
 * Reads for client components only; mutations go through server actions. Runs, the drill-down, the
 * drivers and the share preview are POST reads — their request is a structure, not a value.
 */
export class ReportsRoutes {
  public async list() {
    return Response.json(await hrisApiReportsService.list());
  }

  public async get(id: string) {
    return Response.json(await hrisApiReportsService.get(id));
  }

  public async datasets(request: Request) {
    const dataset = new URL(request.url).searchParams.get("dataset");
    const known = DATASETS.find((d) => d === dataset);
    return Response.json(await hrisApiReportsService.datasets(known));
  }

  public async templates() {
    return Response.json(await hrisApiReportsService.templates());
  }

  public async run(request: Request) {
    const body = await bodyOf<ReportRunUnsavedRequest>(request);
    return Response.json(await hrisApiReportsService.run(body.definition, body.cursor));
  }

  public async runSaved(request: Request, id: string) {
    const body = await bodyOf<ReportRunRequest>(request);
    return Response.json(await hrisApiReportsService.runSaved(id, body));
  }

  public async drilldown(request: Request) {
    const body = await bodyOf<ReportDrilldownRequest>(request);
    return Response.json(await hrisApiReportsService.drilldown(body));
  }

  public async drivers(request: Request) {
    const body = await bodyOf<ReportDriversRequest>(request);
    return Response.json(await hrisApiReportsService.drivers(body));
  }

  public async shares(id: string) {
    return Response.json(await hrisApiReportsService.shares(id));
  }

  public async sharePreview(request: Request, id: string) {
    const body = await bodyOf<ReportShareRequest>(request);
    return Response.json(await hrisApiReportsService.sharePreview(id, body));
  }

  public async publications(request: Request) {
    const reportId = new URL(request.url).searchParams.get("reportId");
    return Response.json(await hrisApiReportsService.publications(reportId || undefined));
  }

  /**
   * A saved report as a file. The format comes from the query string, like every other export route,
   * and wins over whatever the body says; the run's time override is passed on as it is.
   */
  public async exportSaved(request: Request, id: string) {
    const body = await bodyOf<ReportExportRequest>(request);
    return streamBinary(await hrisApiReportsService.exportSaved(id, { time: body.time ?? null, format: formatOf(request) }));
  }

  /** An unsaved definition as a file — the builder's export. */
  public async exportUnsaved(request: Request) {
    const body = await bodyOf<ReportExportRequest>(request);
    return streamBinary(await hrisApiReportsService.exportUnsaved({
      definition: body.definition ?? null,
      time: body.time ?? null,
      format: formatOf(request),
    }));
  }
}

export const reportsRoutes = new ReportsRoutes();
