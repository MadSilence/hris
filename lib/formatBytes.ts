/**
 * A file size in human-readable form: `900 B`, `1.5 KB`, `12 MB`.
 *
 * Floating precision: below 10 units one decimal is shown, above that a whole number, because
 * "12.3 MB" and "12 MB" are equally useful and the second is shorter. Bytes are always whole.
 */
export function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 B";

  const units = ["B", "KB", "MB", "GB", "TB"];
  const index = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1
  );
  const value = bytes / Math.pow(1024, index);

  return `${value.toFixed(value >= 10 || index === 0 ? 0 : 1)} ${units[index]}`;
}
