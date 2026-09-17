/**
 * The time zones a person is offered, and how they are written.
 *
 * <h2>Why a short list and not all four hundred</h2>
 *
 * `Intl.supportedValuesOf("timeZone")` answers with every zone the browser knows — around four
 * hundred, alphabetical, starting at `Africa/Abidjan`. Correct, complete and unusable: nobody scrolls
 * past Africa looking for Warsaw, and most of those entries are aliases of each other.
 *
 * <h2>Why cities and not bare offsets</h2>
 *
 * "UTC+01:00" as a *stored value* is a fixed offset, and a fixed offset does not observe daylight
 * saving. Somebody in Warsaw who picked it would read every summer timestamp an hour early — and
 * "when did this happen" is the one question these settings exist to answer correctly.
 *
 * So the **value** stays a real zone and the **label** carries the offset the person asked to see:
 * `(UTC+01:00) Warsaw`. Searching matches the city, the region and the offset, so typing "warsaw",
 * "europe" or "+01" all find it.
 *
 * <h2>The list is a sample, not a catalogue</h2>
 *
 * One or two representative zones per offset, chosen for population. Somebody whose own city is
 * missing picks a neighbour on the same offset with the same daylight-saving rule — which is what a
 * zone actually is. A zone already stored on the person is always kept, whether it is listed or not.
 */

/** One representative zone per offset, roughly west to east, chosen for population. */
const OFFERED_ZONES = [
  "Pacific/Midway",
  "Pacific/Honolulu",
  "America/Anchorage",
  "America/Los_Angeles",
  "America/Phoenix",
  "America/Denver",
  "America/Mexico_City",
  "America/Chicago",
  "America/Bogota",
  "America/New_York",
  "America/Halifax",
  "America/Sao_Paulo",
  "America/Argentina/Buenos_Aires",
  "Atlantic/Azores",
  "UTC",
  "Europe/London",
  "Europe/Lisbon",
  "Africa/Lagos",
  "Europe/Berlin",
  "Europe/Madrid",
  "Europe/Paris",
  "Europe/Warsaw",
  "Africa/Cairo",
  "Africa/Johannesburg",
  "Europe/Athens",
  "Europe/Kyiv",
  "Asia/Jerusalem",
  "Europe/Istanbul",
  "Europe/Moscow",
  "Africa/Nairobi",
  "Asia/Dubai",
  "Asia/Karachi",
  "Asia/Kolkata",
  "Asia/Dhaka",
  "Asia/Bangkok",
  "Asia/Jakarta",
  "Asia/Shanghai",
  "Asia/Singapore",
  "Asia/Manila",
  "Australia/Perth",
  "Asia/Tokyo",
  "Asia/Seoul",
  "Australia/Brisbane",
  "Australia/Sydney",
  "Pacific/Auckland",
  "Pacific/Fiji",
] as const;

export type TimeZoneChoice = {
  /** A real IANA zone — what gets stored, so daylight saving keeps working. */
  zone: string;
  /** `(UTC+01:00) Warsaw` */
  label: string;
  /** Minutes east of UTC right now, for sorting. */
  offsetMinutes: number;
  /** What a search should match beyond the label: the region, and the offset without punctuation. */
  keywords: string;
};

/** `+01:00` as the zone stands **today** — so a zone on summer time reads as its summer offset. */
export const offsetOf = (zone: string): { text: string; minutes: number } => {
  try {
    const formatted = new Intl.DateTimeFormat("en-GB", { timeZone: zone, timeZoneName: "longOffset" })
      .formatToParts(new Date())
      .find((part) => part.type === "timeZoneName")?.value;

    // Intl writes plain "GMT" for zero rather than "GMT+00:00".
    const sign = formatted?.includes("-") ? -1 : 1;
    const digits = formatted?.match(/(\d{2}):(\d{2})/);
    const minutes = digits ? sign * (Number(digits[1]) * 60 + Number(digits[2])) : 0;

    const absolute = Math.abs(minutes);
    const text = `${minutes < 0 ? "-" : "+"}${pad2(Math.floor(absolute / 60))}:${pad2(absolute % 60)}`;
    return { text, minutes };
  } catch {
    return { text: "+00:00", minutes: 0 };
  }
};

const pad2 = (n: number) => String(n).padStart(2, "0");

/** The last segment of a zone id, as a person writes it: `Europe/Sao_Paulo` → `Sao Paulo`. */
const cityOf = (zone: string): string => {
  if (zone === "UTC") return "UTC";
  const parts = zone.split("/");
  return (parts[parts.length - 1] ?? zone).replace(/_/g, " ");
};

const regionOf = (zone: string): string => (zone.includes("/") ? zone.split("/")[0] ?? "" : "");

const toChoice = (zone: string): TimeZoneChoice => {
  const offset = offsetOf(zone);
  return {
    zone,
    label: `(UTC${offset.text}) ${cityOf(zone)}`,
    offsetMinutes: offset.minutes,
    // "+01", "0100" and the region all find it, as well as the city in the label.
    keywords: `${regionOf(zone)} ${zone} UTC${offset.text} GMT${offset.text} ${offset.text.replace(":", "")}`,
  };
};

/**
 * The offered zones, ordered west to east.
 *
 * @param keep a zone the person already has. Added when it is not one of the offered ones, because a
 *             setting must never silently lose the value it is showing.
 */
export const timeZoneChoices = (keep?: string | null): TimeZoneChoice[] => {
  const zones = [...OFFERED_ZONES] as string[];
  if (keep && !zones.includes(keep)) zones.push(keep);

  return zones
    .map(toChoice)
    .sort((a, b) => a.offsetMinutes - b.offsetMinutes || a.label.localeCompare(b.label));
};
