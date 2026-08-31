/**
 * Размер файла в человекочитаемом виде: `900 B`, `1.5 KB`, `12 MB`.
 *
 * Точность плавающая: до 10 единиц показывается один знак после запятой, дальше — целое, потому что
 * «12.3 MB» и «12 MB» несут одинаково полезную информацию, а второе короче. Байты всегда целые.
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
