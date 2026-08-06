import { ExportDataFormat } from "@/components/modules/settings/shared/ExportDataModal/ExportDataForm";

export const triggerExportDownload = async (
  basePath: string,
  format: ExportDataFormat,
  extraParams?: Record<string, string>,
): Promise<void> => {
  const params = new URLSearchParams({ format, ...(extraParams ?? {}) });
  const response = await fetch(`${basePath}?${params.toString()}`, {
    method: "GET",
    credentials: "same-origin",
  });

  if (!response.ok) {
    throw new Error(await extractErrorMessage(response));
  }

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

const extractErrorMessage = async (response: Response): Promise<string> => {
  try {
    const body = await response.json();
    if (body?.message) return String(body.message);
  } catch {
  }
  return `Export failed (${response.status})`;
};

const parseFilename = (contentDisposition: string | null): string | null => {
  if (!contentDisposition) return null;
  const match = /filename\*?=(?:UTF-8'')?"?([^\";]+)"?/i.exec(contentDisposition);
  return match ? decodeURIComponent(match[1]) : null;
};

const fallbackFilename = (basePath: string, format: ExportDataFormat): string => {
  const resource = basePath.split("/").filter(Boolean).pop() ?? "export";
  return `${resource}.${format}`;
};
