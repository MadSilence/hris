import { ExportDataFormat } from "@/components/modules/settings/shared/ExportDataModal/ExportDataForm";
import { internalApiClient } from "@/components/clients/apiClient";
import { showError } from "@/lib/errors/errorToast";

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

  /*
   * An export is a read, and the client only announces a refusal for writes — `hris:forbidden` is
   * dispatched when `method !== "GET"`, which keeps a page whose queries 403 on load from stacking
   * cards. An export is not a page load: somebody pressed a button and is owed an answer, and every
   * call site writes `void triggerExportDownload(...)`, so the rejection had nowhere to go. Pressing
   * Export with VIEW but not EDIT closed the dialog and did nothing at all (walked 2026-09-18).
   */
  let response: Response;
  try {
    response = await internalApiClient.fetch(path, { method: "GET" });
  } catch (error) {
    showError(error);
    throw error;
  }

  await saveResponse(response, fallbackFilename(basePath, format));
};

/**
 * The same download for an export whose request is a body rather than a query string — People, where
 * the request is the whole table view.
 *
 * **It does not put the failure on screen; the caller does.** A POST is a write as far as the client
 * is concerned, so a 403 has already been announced by `InternalApiClient` (`hris:forbidden`) by the
 * time it lands here, and announcing it again would stack two cards. Anything else is for the dialog
 * that is still open to show, next to the button that was pressed (ERRORS.md: a card is for when the
 * context has closed).
 */
export const triggerExportPostDownload = async (
  basePath: string,
  format: ExportDataFormat,
  body: unknown,
): Promise<void> => {
  const params = new URLSearchParams({ format });
  const path = `${stripApiPrefix(basePath)}?${params.toString()}`;

  const response = await internalApiClient.fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body ?? {}),
  });

  await saveResponse(response, fallbackFilename(basePath, format));
};

/** Hands the bytes to the browser under the name `Content-Disposition` gives, or the fallback. */
const saveResponse = async (response: Response, fallbackName: string): Promise<void> => {
  const blob = await response.blob();
  const objectUrl = URL.createObjectURL(blob);

  const anchor = document.createElement("a");
  anchor.href = objectUrl;
  anchor.download = parseFilename(response.headers.get("content-disposition")) ?? fallbackName;
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
