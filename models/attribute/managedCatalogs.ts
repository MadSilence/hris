import { AttributeType } from "@/models/attribute/AttributeType";

/** Managed option-sets: SELECT-like attributes whose choices come from a system catalog
 *  (ISO countries/languages, IANA timezones, ISO currencies) rather than per-attribute options.
 *  We store the human-readable label (country stores the name, currency stores the code, etc.) so
 *  every surface (profile, table, filter) shows it consistently without any resolution step. */

export type CatalogOption = { value: string; label: string };

const MANAGED_TYPES = new Set<AttributeType>([
  AttributeType.COUNTRY,
  AttributeType.LANGUAGE,
  AttributeType.TIMEZONE,
  AttributeType.CURRENCY,
]);

export const isManagedCatalogType = (t: AttributeType): boolean => MANAGED_TYPES.has(t);

// ISO 3166-1 alpha-2 country codes (labels resolved via Intl.DisplayNames).
const COUNTRY_CODES =
  "AD AE AF AG AI AL AM AO AQ AR AS AT AU AW AX AZ BA BB BD BE BF BG BH BI BJ BL BM BN BO BQ BR BS BT BV BW BY BZ CA CC CD CF CG CH CI CK CL CM CN CO CR CU CV CW CX CY CZ DE DJ DK DM DO DZ EC EE EG EH ER ES ET FI FJ FK FM FO FR GA GB GD GE GF GG GH GI GL GM GN GP GQ GR GS GT GU GW GY HK HM HN HR HT HU ID IE IL IM IN IO IQ IR IS IT JE JM JO JP KE KG KH KI KM KN KP KR KW KY KZ LA LB LC LI LK LR LS LT LU LV LY MA MC MD ME MF MG MH MK ML MM MN MO MP MQ MR MS MT MU MV MW MX MY MZ NA NC NE NF NG NI NL NO NP NR NU NZ OM PA PE PF PG PH PK PL PM PN PR PS PT PW PY QA RE RO RS RU RW SA SB SC SD SE SG SH SI SJ SK SL SM SN SO SR SS ST SV SX SY SZ TC TD TF TG TH TJ TK TL TM TN TO TR TT TV TW TZ UA UG UM US UY UZ VA VC VE VG VI VN VU WF WS YE YT ZA ZM ZW".split(
    " ",
  );

// Common ISO 639-1 language codes (labels resolved via Intl.DisplayNames).
const LANGUAGE_CODES =
  "aa ab af am ar as az be bg bm bn bo bs ca cs cy da de dv dz ee el en eo es et eu fa ff fi fo fr fy ga gd gl gu gv ha he hi hr ht hu hy id ig is it ja jv ka kk kl km kn ko ks ku kw ky lb lg ln lo lt lu lv mg mi mk ml mn mr ms mt my nb nd ne nl nn no om or pa pl ps pt qu rm rn ro ru rw sd se sg si sk sl sn so sq sr ss st su sv sw ta te tg th ti tk tl tn to tr ts tt ug uk ur uz ve vi wo xh yi yo zh zu".split(
    " ",
  );

function displayName(type: "region" | "language" | "currency", code: string): string | null {
  try {
    return new Intl.DisplayNames(["en"], { type }).of(code) ?? null;
  } catch {
    return null;
  }
}

function supportedValues(kind: "currency" | "timeZone"): string[] {
  try {
    const fn = (Intl as unknown as { supportedValuesOf?: (k: string) => string[] })
      .supportedValuesOf;
    return fn ? fn(kind) : [];
  } catch {
    return [];
  }
}

function dedupeSort(options: CatalogOption[]): CatalogOption[] {
  const seen = new Set<string>();
  const out: CatalogOption[] = [];
  for (const o of options) {
    if (!o.value || seen.has(o.value)) continue;
    seen.add(o.value);
    out.push(o);
  }
  return out.sort((a, b) => a.label.localeCompare(b.label));
}

const cache = new Map<AttributeType, CatalogOption[]>();

function buildOptions(type: AttributeType): CatalogOption[] {
  switch (type) {
    case AttributeType.COUNTRY:
      return dedupeSort(
        COUNTRY_CODES.map((c) => {
          const name = displayName("region", c) ?? c;
          return { value: name, label: name };
        }),
      );
    case AttributeType.LANGUAGE:
      return dedupeSort(
        LANGUAGE_CODES.map((c) => {
          const name = displayName("language", c) ?? c;
          return { value: name, label: name };
        }),
      );
    case AttributeType.TIMEZONE: {
      const zones = supportedValues("timeZone");
      const list = zones.length > 0 ? zones : ["UTC"];
      return dedupeSort(list.map((z) => ({ value: z, label: z })));
    }
    case AttributeType.CURRENCY: {
      const codes = supportedValues("currency");
      const list = codes.length > 0 ? codes : ["USD", "EUR", "GBP"];
      return dedupeSort(
        list.map((code) => {
          const name = displayName("currency", code);
          return { value: code, label: name ? `${code} — ${name}` : code };
        }),
      ).sort((a, b) => a.value.localeCompare(b.value));
    }
    default:
      return [];
  }
}

/** Options for a managed catalog type (cached). Empty for non-managed types. */
export function getCatalogOptions(type: AttributeType): CatalogOption[] {
  if (!isManagedCatalogType(type)) return [];
  const cached = cache.get(type);
  if (cached) return cached;
  const built = buildOptions(type);
  cache.set(type, built);
  return built;
}
