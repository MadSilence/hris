/** Формат выгрузки из query-строки. Всё, что не `csv`, считается `xlsx` — это дефолт модалки. */
export type ExportFormat = "csv" | "xlsx";

export const formatOf = (req: Request): ExportFormat =>
  new URL(req.url).searchParams.get("format") === "csv" ? "csv" : "xlsx";

/**
 * Отдаёт бинарный ответ Java как есть.
 *
 * Пробрасываются ровно два заголовка: тип и `Content-Disposition` — по нему браузер берёт имя файла,
 * которое сформировал `Exporter` на бэкенде. Тело не буферизуется: выгрузка может быть большой.
 */
export const streamBinary = (backendResponse: Response) =>
  new Response(backendResponse.body, {
    status: backendResponse.status,
    headers: {
      "Content-Type": backendResponse.headers.get("content-type") ?? "application/octet-stream",
      "Content-Disposition": backendResponse.headers.get("content-disposition") ?? "attachment",
    },
  });
