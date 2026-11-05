import type { useTranslations } from "next-intl";

/**
 * "Chrome on Windows" from a User-Agent string — enough for a person to recognise their own laptop in
 * a list. Not a parser: the order of the checks is what matters (Edge and Opera say "Chrome" too,
 * Chrome says "Safari"). Browser and system names are brands; the words around them come from `t`.
 */
export const describeUserAgent = (
  ua: string | null | undefined,
  t: ReturnType<typeof useTranslations<"auth">>,
): string => {
  if (!ua) return t("sessions.userAgent.unknown");
  const browser = /Edg\//.test(ua)
    ? "Edge"
    : /OPR\//.test(ua)
      ? "Opera"
      : /Firefox\//.test(ua)
        ? "Firefox"
        : /Chrome\//.test(ua)
          ? "Chrome"
          : /Safari\//.test(ua)
            ? "Safari"
            : null;
  const os = /Windows/.test(ua)
    ? "Windows"
    : /iPhone|iPad/.test(ua)
      ? "iOS"
      : /Mac OS X/.test(ua)
        ? "macOS"
        : /Android/.test(ua)
          ? "Android"
          : /Linux/.test(ua)
            ? "Linux"
            : null;
  const name = browser ?? t("sessions.userAgent.aBrowser");
  return os ? t("sessions.userAgent.browserOnOs", { browser: name, os }) : name;
};
