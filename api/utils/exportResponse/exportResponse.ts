/** The export format from the query string. Anything other than `csv` is `xlsx`, the modal's default. */
export type ExportFormat = "csv" | "xlsx";

export const formatOf = (req: Request): ExportFormat =>
  new URL(req.url).searchParams.get("format") === "csv" ? "csv" : "xlsx";

/**
 * Passes the Java binary response through as is.
 *
 * Exactly two headers are forwarded: the type and `Content-Disposition`, from which the browser takes
 * the file name the backend's `Exporter` produced. The body is not buffered: an export can be large.
 */
export const streamBinary = (backendResponse: Response) =>
  new Response(backendResponse.body, {
    status: backendResponse.status,
    headers: {
      "Content-Type": backendResponse.headers.get("content-type") ?? "application/octet-stream",
      "Content-Disposition": backendResponse.headers.get("content-disposition") ?? "attachment",
    },
  });
