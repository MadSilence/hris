import { apiRequestWrapper } from "@/api/utils/apiRequestWrapper";
import { formatOf, streamBinary } from "@/api/utils/exportResponse";
import { hrisCompanyCalendarService } from "@/api/modules/calendar/services";
import type { CompanyCalendarExportRequest } from "@/api/modules/calendar/clients";

/** The board as a file — a POST, because the request is the board's whole view. Streamed through. */
export const POST = apiRequestWrapper(async (req: Request) => {
  const body = (await req.json().catch(() => ({}))) as Partial<CompanyCalendarExportRequest>;
  return streamBinary(
    await hrisCompanyCalendarService.export({
      from: body.from ?? "",
      to: body.to ?? "",
      q: body.q ?? null,
      filters: body.filters ?? null,
      format: formatOf(req),
    }),
  );
});
