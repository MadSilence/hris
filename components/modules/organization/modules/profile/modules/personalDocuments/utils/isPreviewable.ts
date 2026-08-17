/**
 * What the preview dialog can render inline. Everything else stays download-only — guessing at a
 * viewer for arbitrary office formats is worse than an honest "download to open".
 */
export const isPreviewable = (mimeType?: string | null): boolean => {
  if (!mimeType) return false;
  return mimeType.startsWith("image/") || mimeType === "application/pdf";
};
