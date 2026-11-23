/**
 * "MacBook · Chrome" from a User-Agent string (manage-account spec, Sessions: "{Device} · {Browser}"). Not a parser:
 * the order of the checks is what matters — Edge and Opera say "Chrome" too, Chrome says "Safari", an iPad may say
 * "Macintosh". Device and browser names are brands; null where the string does not say, for the caller's words.
 */
export const deviceOf = (ua: string | null | undefined): { device: string | null; browser: string | null } => {
  if (!ua) return { device: null, browser: null };
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
  const device = /iPhone/.test(ua)
    ? "iPhone"
    : /iPad/.test(ua)
      ? "iPad"
      : /Android/.test(ua)
        ? "Android"
        : /Windows/.test(ua)
          ? "Windows"
          : /Mac OS X|Macintosh/.test(ua)
            ? "Mac"
            : /CrOS/.test(ua)
              ? "Chromebook"
              : /Linux/.test(ua)
                ? "Linux"
                : null;
  return { device, browser };
};
