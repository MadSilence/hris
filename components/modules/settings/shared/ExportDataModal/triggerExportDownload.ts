import { ExportDataFormat } from "@/components/modules/settings/shared/ExportDataModal/ExportDataForm";
import { internalApiClient } from "@/components/clients/apiClient";

/**
 * Downloads an export, through the same client as every other read.
 *
 * <p>**It used to be a bare `fetch` to `/api`**, which is the one thing `hris/CLAUDE.md`
 * § "API Communication" asks feature code never to do — and the reasons are exactly the ones that
 * were missing here. `InternalApiClient` renews an expired session once and replays the request; it
 * maps a status onto a typed exception, so a 403 becomes a `ForbiddenError` the caller can tell from
 * an outage; and it dispatches `hris:forbidden`, which is what puts a refusal on screen. A bare
 * `fetch` had none of that: **an export refused after ten minutes on the page failed silently, and
 * an export refused for lack of permission failed the same way as a dead backend.**
 *
 * <p>The client's `fetch` returns the raw `Response` precisely so that a caller who needs the body
 * as bytes can have it. Nothing had to be built; this had to stop going around it.
 *
 * <p>`basePath` is still written as `/api/…` at every call site, because that is what it reads as
 * from a component. The prefix is stripped here rather than at ten call sites.
 */
export const triggerExportDownload = async (
  basePath: string,
  format: ExportDataFormat,
  extraParams?: Record<string, string>,
): Promise<void> => {
  const params = new URLSearchParams({ format, ...(extraParams ?? {}) });
  const path = `${stripApiPrefix(basePath)}?${params.toString()}`;

  const response = await internalApiClient.fetch(path, { method: "GET" });

  const blob = await response.blob();
  const objectUrl = URL.createObjectURL(blob);

  const anchor = document.createElement("a");
  anchor.href = objectUrl;
  anchor.download =
    parseFilename(response.headers.get("content-disposition")) ??
    fallbackFilename(basePath, format);
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();

  URL.revokeObjectURL(objectUrl);
};

/** The client prepends `/api` itself; a call site that already wrote it must not get it twice. */
const stripApiPrefix = (basePath: string): string =>
  basePath.startsWith("/api/") ? basePath.slice("/api".length) : basePath;

const parseFilename = (contentDisposition: string | null): string | null => {
  if (!contentDisposition) return null;
  const match = /filename\*?=(?:UTF-8'')?"?([^";]+)"?/i.exec(contentDisposition);
  return match ? decodeURIComponent(match[1]) : null;
};

const fallbackFilename = (basePath: string, format: ExportDataFormat): string => {
  const resource = basePath.split("/").filter(Boolean).pop() ?? "export";
  return `${resource}.${format}`;
};
